"""
Database Ingestion Engine for Indian Standards Recommender.
Loads standards_master.jsonl and qco_master.json into PostgreSQL (with SQLite dual-mode support).
Builds the Allied Standards Graph (edges) from Sectional Committees, QCOs, and Supersession chains.
"""

import os
import json
import sqlite3
from typing import List, Dict, Any

try:
    import psycopg2
    from psycopg2.extras import execute_batch
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
STANDARDS_JSONL = os.path.join(DATA_DIR, "standards_master.jsonl")
QCO_JSON = os.path.join(DATA_DIR, "qco_master.json")
SQLITE_DB = os.path.join(DATA_DIR, "standards.db")

# PostgreSQL default connection parameters
PG_HOST = os.getenv("POSTGRES_HOST", "localhost")
PG_PORT = os.getenv("POSTGRES_PORT", "5432")
PG_DB = os.getenv("POSTGRES_DB", "is_recommender")
PG_USER = os.getenv("POSTGRES_USER", "postgres")
PG_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")

def load_records_from_jsonl(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        print(f"[!] File not found: {path}")
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))
    return records

def load_records_from_json(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def init_sqlite_db(db_path: str = SQLITE_DB):
    """Initializes high-performance local SQLite database mirroring PostgreSQL schema."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS standards (
        family_id TEXT PRIMARY KEY,
        prefix TEXT,
        number TEXT,
        part TEXT,
        section TEXT,
        title_en TEXT,
        title_hi TEXT,
        scope_text TEXT,
        committee TEXT,
        committee_code TEXT,
        division TEXT,
        tier TEXT DEFAULT 'CATALOGUE_EVIDENCE',
        raw_id TEXT,
        status TEXT DEFAULT 'CURRENT',
        num_amendments INTEGER DEFAULT 0,
        year INTEGER,
        archive_url TEXT,
        pdf_url TEXT,
        product_type TEXT,
        domain TEXT,
        material TEXT,
        application TEXT,
        standard_type TEXT,
        is_test_standard INTEGER DEFAULT 0,
        related_products TEXT
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_std_number ON standards(number);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_std_comm ON standards(committee_code);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_std_div ON standards(division);")

    # FTS5 Full Text Search index for sub-millisecond lexical search
    cur.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS standards_fts USING fts5(
        family_id,
        raw_id,
        title_en,
        division,
        committee
    );
    """)

    # Allied Standards Graph Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS edges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        src_family_id TEXT,
        dst_family_id TEXT,
        edge_type TEXT,
        provenance TEXT,
        confidence REAL DEFAULT 1.0,
        UNIQUE(src_family_id, dst_family_id, edge_type, provenance)
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_edge_src ON edges(src_family_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_edge_dst ON edges(dst_family_id);")

    # Compulsory Certification & QCOs
    cur.execute("""
    CREATE TABLE IF NOT EXISTS cert_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme TEXT,
        category TEXT,
        sr_no TEXT,
        raw_is_no TEXT,
        family_id TEXT,
        product_name TEXT,
        gazette_notification TEXT,
        status TEXT DEFAULT 'IN_FORCE',
        source_url TEXT
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cert_family ON cert_rules(family_id);")

    conn.commit()
    return conn

def populate_sqlite(standards: List[Dict[str, Any]], qcos: List[Dict[str, Any]], db_path: str = SQLITE_DB):
    print(f"[*] Populating SQLite database: {db_path}...")
    conn = init_sqlite_db(db_path)
    cur = conn.cursor()

    # Insert standards
    std_rows = []
    fts_rows = []
    seen_ids = set()

    for s in standards:
        fid = s.get("family_id")
        if not fid or fid in seen_ids:
            continue
        seen_ids.add(fid)

        std_rows.append((
            fid,
            s.get("prefix", "IS"),
            s.get("number"),
            s.get("part"),
            s.get("section"),
            s.get("title_en"),
            s.get("title_hi"),
            s.get("scope_text"),
            s.get("committee"),
            s.get("committee_code"),
            s.get("division"),
            s.get("tier", "CATALOGUE_EVIDENCE"),
            s.get("raw_id"),
            s.get("status", "CURRENT"),
            s.get("num_amendments", 0),
            s.get("year"),
            s.get("archive_url"),
            s.get("pdf_url")
        ))
        fts_rows.append((
            fid,
            s.get("raw_id", ""),
            s.get("title_en", ""),
            s.get("division", "") or "",
            s.get("committee", "") or ""
        ))

    cur.executemany("""
    INSERT OR REPLACE INTO standards (
        family_id, prefix, number, part, section, title_en, title_hi, scope_text,
        committee, committee_code, division, tier, raw_id, status, num_amendments,
        year, archive_url, pdf_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, std_rows)

    # Populate FTS5
    cur.execute("DELETE FROM standards_fts;")
    cur.executemany("""
    INSERT INTO standards_fts (family_id, raw_id, title_en, division, committee)
    VALUES (?, ?, ?, ?, ?)
    """, fts_rows)

    # Build Allied Standards Graph (Edges)
    print("[*] Generating Allied Standards Graph edges...")
    edges = []
    
    # 1. Supersession edges
    for s in standards:
        fid = s.get("family_id")
        sup = s.get("superceded_by")
        if fid and sup:
            sup_clean = sup.strip().replace(" ", "")
            edges.append((fid, f"IS:{sup_clean}", "SUPERSEDES", "CATALOGUE_STATUS", 1.0))

    # 2. Committee Council edges (standards created by the same BIS technical committee)
    committee_groups = {}
    for s in standards:
        c_code = s.get("committee_code")
        fid = s.get("family_id")
        if c_code and fid:
            committee_groups.setdefault(c_code, []).append(fid)

    for c_code, fids in committee_groups.items():
        if len(fids) > 1:
            # Connect up to first 10 neighbours per committee to prevent dense graph blowup
            sample_fids = fids[:10]
            for i in range(len(sample_fids)):
                for j in range(i + 1, min(i + 4, len(sample_fids))):
                    edges.append((sample_fids[i], sample_fids[j], "RELATED_PRODUCT", "COMMITTEE_COUNCIL", 0.7))
                    edges.append((sample_fids[j], sample_fids[i], "RELATED_PRODUCT", "COMMITTEE_COUNCIL", 0.7))

    cur.executemany("""
    INSERT OR IGNORE INTO edges (src_family_id, dst_family_id, edge_type, provenance, confidence)
    VALUES (?, ?, ?, ?, ?)
    """, edges)

    # Insert QCOs and Mandatory Hallmarking Orders
    if qcos:
        qco_rows = []
        for q in qcos:
            qco_rows.append((
                q.get("scheme"),
                q.get("category"),
                q.get("sr_no"),
                q.get("raw_is_no"),
                q.get("family_id"),
                q.get("product_name"),
                q.get("gazette_notification"),
                q.get("status", "IN_FORCE"),
                q.get("source_url")
            ))
        
        # Mandatory BIS Hallmarking Scheme IV Orders (Gold & Silver)
        qco_rows.extend([
            (
                "HALLMARKING", "Jewellery and Artefacts", 1, "IS 1417 : 2016", "IS:1417",
                "Gold jewellery and gold artefacts (Mandatory Hallmarking in notified districts)",
                "Hallmarking of Gold Jewellery and Gold Artefacts Order, 2020 (S.O. 358(E) amended 2021-2026)",
                "MANDATORY", "https://www.bis.gov.in/hallmarking-overview/"
            ),
            (
                "HALLMARKING", "Jewellery and Artefacts", 2, "IS 2112 : 2014", "IS:2112",
                "Silver jewellery and silver artefacts",
                "Hallmarking of Silver Jewellery and Silver Artefacts Order",
                "MANDATORY", "https://www.bis.gov.in/hallmarking-overview/"
            )
        ])

        cur.executemany("""
        INSERT INTO cert_rules (
            scheme, category, sr_no, raw_is_no, family_id, product_name,
            gazette_notification, status, source_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, qco_rows)

    conn.commit()
    conn.close()
    print(f"[SUCCESS] SQLite database populated: {len(std_rows)} standards, {len(edges)} graph edges, {len(qcos)} QCO records.")

def try_populate_postgres(standards: List[Dict[str, Any]], qcos: List[Dict[str, Any]]):
    """Attempts to populate PostgreSQL if the service is running."""
    if not HAS_PSYCOPG2:
        print("[!] psycopg2 not installed; skipping direct PostgreSQL population.")
        return False

    try:
        conn = psycopg2.connect(
            host=PG_HOST, port=PG_PORT, dbname=PG_DB, user=PG_USER, password=PG_PASSWORD, connect_timeout=3
        )
        cur = conn.cursor()
        print("[*] Successfully connected to PostgreSQL! Populating tables...")

        # Read schema file and execute
        schema_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "postgres_schema.sql")
        if os.path.exists(schema_file):
            with open(schema_file, "r", encoding="utf-8") as f:
                cur.execute(f.read())
            conn.commit()

        # Insert standards
        insert_query = """
        INSERT INTO standards (
            family_id, prefix, number, part, section, title_en, title_hi, scope_text,
            committee, committee_code, division, tier, raw_id, status, num_amendments, year
        ) VALUES (
            %(family_id)s, %(prefix)s, %(number)s, %(part)s, %(section)s, %(title_en)s,
            %(title_hi)s, %(scope_text)s, %(committee)s, %(committee_code)s, %(division)s,
            %(tier)s, %(raw_id)s, %(status)s, %(num_amendments)s, %(year)s
        ) ON CONFLICT (family_id) DO UPDATE SET
            title_en = EXCLUDED.title_en,
            committee = EXCLUDED.committee,
            division = EXCLUDED.division,
            status = EXCLUDED.status;
        """
        execute_batch(cur, insert_query, standards, page_size=2000)
        conn.commit()
        cur.close()
        conn.close()
        print(f"[SUCCESS] PostgreSQL database populated with {len(standards)} standards!")
        return True
    except Exception as e:
        print(f"[*] PostgreSQL is currently offline or unreachable ({e}). Data safely stored in SQLite & JSONL!")
        return False

def run_ingestion():
    standards = load_records_from_jsonl(STANDARDS_JSONL)
    qcos = load_records_from_json(QCO_JSON)
    if not standards:
        print("[!] No standards found in JSONL. Please run data_pipeline/fetch_standards.py first.")
        return

    populate_sqlite(standards, qcos)
    try_populate_postgres(standards, qcos)

if __name__ == "__main__":
    run_ingestion()
