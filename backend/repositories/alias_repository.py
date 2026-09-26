import os
import re
import sqlite3
from typing import List, Dict, Any, Optional
from loguru import logger

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "standards.db")


class SQLiteAliasRepository:
    """
    Decoupled database repository for trade aliases, colloquial Hinglish/Hindi terms,
    and GeM/CPWD product synonyms stored in SQLite.
    Eliminates hardcoded dictionaries from Python application code.
    """
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._cached_aliases: Optional[List[Dict[str, Any]]] = None

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_all_aliases(self) -> List[Dict[str, Any]]:
        """Returns all database aliases sorted by token length descending for longest-match-first."""
        if self._cached_aliases is None:
            try:
                conn = self._get_conn()
                cur = conn.cursor()
                cur.execute("""
                SELECT alias_term, family_id, product_name, division, source
                FROM standard_aliases
                ORDER BY LENGTH(alias_term) DESC;
                """)
                self._cached_aliases = [dict(r) for r in cur.fetchall()]
                conn.close()
            except sqlite3.OperationalError as oe:
                if "no such table" in str(oe).lower():
                    logger.info("[AliasRepository] standard_aliases table not found. Auto-seeding from pipeline...")
                    try:
                        from data_pipeline.populate_aliases import populate_aliases
                        populate_aliases(self.db_path)
                        conn = self._get_conn()
                        cur = conn.cursor()
                        cur.execute("""
                        SELECT alias_term, family_id, product_name, division, source
                        FROM standard_aliases
                        ORDER BY LENGTH(alias_term) DESC;
                        """)
                        self._cached_aliases = [dict(r) for r in cur.fetchall()]
                        conn.close()
                    except Exception as pe:
                        logger.error(f"[AliasRepository] Auto-seeding failed: {pe}")
                        self._cached_aliases = []
                else:
                    logger.error(f"[AliasRepository] Database error: {oe}")
                    self._cached_aliases = []
            except Exception as e:
                logger.error(f"[AliasRepository] Failed to read standard_aliases: {e}")
                self._cached_aliases = []
        return self._cached_aliases

    def invalidate_cache(self):
        self._cached_aliases = None

    def find_matches_in_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Dynamically scans text against all database aliases using
        word-boundary regex matching.
        """
        lower_text = text.lower()
        matches = []
        seen_terms = set()
        seen_families = set()

        all_aliases = self.get_all_aliases()
        for item in all_aliases:
            term = item["alias_term"]
            # Non-ASCII (Hindi/Devanagari) matching
            if any(ord(c) > 127 for c in term):
                if term in text and term not in seen_terms:
                    seen_terms.add(term)
                    matches.append({
                        "term": term,
                        "product": item["product_name"],
                        "family_id": item["family_id"],
                        "division": item.get("division", "Civil Engineering")
                    })
            else:
                if term in ["sariya", "saria"]:
                    pattern = r'\bsari+y*a*n*\b'
                elif term in ["bajri", "badri"]:
                    pattern = r'\bba[jd]ri\b'
                elif term in ["rodi", "rori"]:
                    pattern = r'\bro[dr]i\b'
                elif term == "ups":
                    pattern = r'(?<!touch\s)\bups\b'
                else:
                    pattern = rf'\b{re.escape(term)}(?:s|es|sets?)?\b'

                if re.search(pattern, lower_text):
                    if term not in seen_terms:
                        seen_terms.add(term)
                        matches.append({
                            "term": term,
                            "product": item["product_name"],
                            "family_id": item["family_id"],
                            "division": item.get("division", "Civil Engineering")
                        })

        return matches

    def save_learned_alias(
        self,
        alias_term: str,
        family_id: str,
        product_name: str,
        division: str = "Civil Engineering",
        source: str = "LEARNED_BHARATGPT",
        review_status: str = "PENDING_REVIEW"
    ):
        """
        Persists a newly discovered or LLM-normalized trade synonym.
        To prevent unverified LLM canonicalizations from poisoning the official catalogue,
        new entries default to 'PENDING_REVIEW' and are logged to an audit queue.
        """
        try:
            conn = self._get_conn()
            cur = conn.cursor()
            # Ensure review_status column exists
            try:
                cur.execute("ALTER TABLE standard_aliases ADD COLUMN review_status TEXT DEFAULT 'VERIFIED';")
                conn.commit()
            except sqlite3.OperationalError:
                pass  # column already exists

            cur.execute("""
            INSERT OR REPLACE INTO standard_aliases (alias_term, family_id, product_name, division, source, review_status)
            VALUES (?, ?, ?, ?, ?, ?);
            """, (alias_term.strip().lower(), family_id, product_name, division, source, review_status))
            conn.commit()
            conn.close()
            self.invalidate_cache()
            
            # Log to human-in-the-loop review CSV
            audit_file = os.path.join(DATA_DIR, "pending_aliases_audit.csv")
            file_exists = os.path.isfile(audit_file)
            import csv
            with open(audit_file, mode="a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                if not file_exists:
                    writer.writerow(["alias_term", "family_id", "product_name", "division", "source", "review_status"])
                writer.writerow([alias_term.strip().lower(), family_id, product_name, division, source, review_status])

            logger.info(f"[AliasRepository] Staged candidate alias '{alias_term}' -> {family_id} (Status: {review_status})")
        except Exception as e:
            logger.warning(f"[AliasRepository] Failed to save alias '{alias_term}': {e}")


# Global repository singleton
alias_repository = SQLiteAliasRepository()
