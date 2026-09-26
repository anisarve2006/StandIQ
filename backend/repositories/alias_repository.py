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
                if term == "ups":
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
        source: str = "LEARNED_BHARATGPT"
    ):
        """
        Persists a newly discovered or LLM-normalized trade synonym
        into SQLite so future queries resolve instantaneously.
        """
        try:
            conn = self._get_conn()
            cur = conn.cursor()
            cur.execute("""
            INSERT OR REPLACE INTO standard_aliases (alias_term, family_id, product_name, division, source)
            VALUES (?, ?, ?, ?, ?);
            """, (alias_term.strip().lower(), family_id, product_name, division, source))
            conn.commit()
            conn.close()
            self.invalidate_cache()
            logger.info(f"[AliasRepository] Persisted new trade alias '{alias_term}' -> {family_id}")
        except Exception as e:
            logger.warning(f"[AliasRepository] Failed to save alias '{alias_term}': {e}")


# Global repository singleton
alias_repository = SQLiteAliasRepository()
