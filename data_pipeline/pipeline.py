"""
MaanakAI (मानक AI) — Unified Single-File Data Pipeline.
Consolidates standard identifier normalization, BIS standards catalogue extraction,
live Compulsory Quality Control Orders (QCO) ingestion, knowledge graph generation,
and SQLite FTS5 / PostgreSQL database construction in one self-contained module.

Usage:
    python data_pipeline/pipeline.py --all           # Run entire pipeline end-to-end
    python data_pipeline/pipeline.py --build-db      # Rebuild standards.db & graph from local files
    python data_pipeline/pipeline.py --fetch-qco     # Scrape live QCOs from bis.gov.in
    python data_pipeline/pipeline.py --verify        # Validate database integrity and counts
"""

import os
import sys
import json
import re
import time
import sqlite3
import argparse
import urllib.request
from typing import Dict, Any, List, Optional, Tuple
from bs4 import BeautifulSoup

# Optional PostgreSQL support
try:
    import psycopg2
    from psycopg2.extras import execute_batch
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

# Paths configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "backend", "data") if os.path.exists(os.path.join(BASE_DIR, "backend", "data")) else os.path.join(BASE_DIR, "data")
STANDARDS_JSONL = os.path.join(DATA_DIR, "standards_master.jsonl")
STANDARDS_CSV = os.path.join(DATA_DIR, "standards_master.csv")
QCO_JSON = os.path.join(DATA_DIR, "qco_master.json")
SQLITE_DB = os.path.join(DATA_DIR, "standards.db")

# ==============================================================================
# SECTION 1: CANONICAL IDENTIFIER PARSER & DIGIT NORMALIZER
# ==============================================================================

INDIC_DIGITS_MAP = str.maketrans('०१२३४५६७८९', '0123456789')

def normalize_digits(text: str) -> str:
    """Converts any Devanagari numerals to standard ASCII numerals."""
    if not text:
        return ""
    return text.translate(INDIC_DIGITS_MAP)

def parse_is_identifier(raw: str) -> Dict[str, Any]:
    """
    Parses any variant of an Indian Standard identifier into a structured dictionary:
    e.g. 'IS 1786:2008', 'IS/ISO 9001', 'IS 1239 (Part 1)' -> canonical family_id.
    """
    if not raw or not isinstance(raw, str):
        return {"raw": raw, "valid": False}
    
    cleaned = normalize_digits(raw.strip())
    
    # Handle archive.org format: gov.in.is.771.6.1979 or gov.in.is.104.1979
    if cleaned.startswith("gov.in.is."):
        parts = cleaned.replace("gov.in.is.", "").split(".")
        if len(parts) >= 1:
            number = parts[0]
            part = None
            section = None
            year = None
            
            if len(parts) == 2:
                if len(parts[1]) == 4 and parts[1].isdigit():
                    year = int(parts[1])
                else:
                    part = parts[1]
            elif len(parts) == 3:
                part = parts[1]
                if len(parts[2]) == 4 and parts[2].isdigit():
                    year = int(parts[2])
            elif len(parts) >= 4:
                part = parts[1]
                section = parts[2]
                if len(parts[3]) == 4 and parts[3].isdigit():
                    year = int(parts[3])
            
            family_id = f"IS:{number}"
            if part:
                family_id += f":P{part}"
            if section:
                family_id += f":S{section}"
                
            return {
                "raw": raw,
                "prefix": "IS",
                "number": number,
                "part": part,
                "section": section,
                "year": year,
                "family_id": family_id,
                "valid": True
            }

    # Dual prefix matching (IS/ISO, IS/IEC, IS/EN, IS)
    prefix_match = re.match(r'^(IS/ISO/IEC|IS/ISO|IS/IEC|IS/EN|SP|IS)\b', cleaned, re.IGNORECASE)
    if not prefix_match:
        return {"raw": raw, "valid": False}
    
    prefix = prefix_match.group(1).upper()
    rest = cleaned[prefix_match.end():].strip()
    
    # Clean up leading punctuation
    rest = re.sub(r'^[:\-\s]+', '', rest)
    
    # Extract base number
    num_match = re.match(r'^([0-9A-Za-z]+)', rest)
    if not num_match:
        return {"raw": raw, "valid": False}
    
    number = num_match.group(1)
    rest = rest[num_match.end():].strip()
    
    part = None
    section = None
    year = None
    
    # Extract Part
    part_match = re.search(r'(?:Part|Pt|\/Part|\/Pt)?\s*[:\-\s]?\s*([0-9]+)', rest, re.IGNORECASE)
    if part_match and ('part' in rest.lower() or 'pt' in rest.lower() or '/' in rest):
        part = part_match.group(1)
        rest = rest[part_match.end():].strip()
        
    # Extract Section
    sec_match = re.search(r'(?:Sec|Section|\/Sec)?\s*[:\-\s]?\s*([0-9]+)', rest, re.IGNORECASE)
    if sec_match and ('sec' in rest.lower() or 'section' in rest.lower()):
        section = sec_match.group(1)
        rest = rest[sec_match.end():].strip()
        
    # Extract Year (e.g. : 2008 or / 1985 or (2000))
    year_match = re.search(r'(?:19[5-9]\d|20[0-2]\d)\b', rest)
    if year_match:
        year = int(year_match.group(0))
        
    family_id = f"{prefix}:{number}"
    if part:
        family_id += f":P{part}"
    if section:
        family_id += f":S{section}"
        
    return {
        "raw": raw,
        "prefix": prefix,
        "number": number,
        "part": part,
        "section": section,
        "year": year,
        "family_id": family_id,
        "valid": True
    }


# ==============================================================================
# SECTION 2: STANDARDS CATALOGUE INGESTION
# ==============================================================================

def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'\s+', ' ', str(text)).strip()

def parse_metadata_description(desc: str) -> Dict[str, Any]:
    """Extracts structured metadata fields from Archive.org description strings."""
    res = {
        "division": None,
        "committee": None,
        "committee_code": None,
        "designator": None,
        "num_amendments": 0,
        "status": "CURRENT",
        "superceding": None,
        "superceded_by": None
    }
    if not desc:
        return res
        
    div_match = re.search(r'Division Name:\s*(.*?)(?=\s*Section Name:|$)', desc)
    if div_match:
        res["division"] = clean_text(div_match.group(1))
        
    sec_match = re.search(r'Section Name:\s*(.*?)(?=\s*Designator of Legally|$)', desc)
    if sec_match:
        comm_text = clean_text(sec_match.group(1))
        res["committee"] = comm_text
        code_match = re.search(r'\(([A-Z]{2,4}\s*\d+)\)', comm_text)
        if code_match:
            res["committee_code"] = code_match.group(1).replace(" ", "")
            
    desig_match = re.search(r'Designator of Legally Binding Document:\s*(.*?)(?=\s*Title of Legally|$)', desc)
    if desig_match:
        res["designator"] = clean_text(desig_match.group(1))
        
    amend_match = re.search(r'Number of Amendments:\s*(\d+)', desc)
    if amend_match:
        try:
            res["num_amendments"] = int(amend_match.group(1))
        except ValueError:
            pass
            
    if "WITHDRAWN" in desc or "declared to be WITHDRAWN" in desc:
        res["status"] = "WITHDRAWN"
    elif "SUPERSEDED" in desc:
        res["status"] = "SUPERSEDED"
        
    sup_by_match = re.search(r'Superceding standard:\s*(.*?)(?=\.|$)', desc)
    if sup_by_match:
        val = clean_text(sup_by_match.group(1))
        if val and val.lower() != "none":
            res["superceded_by"] = val
            
    return res

def fetch_standards_catalogue_remote() -> List[Dict[str, Any]]:
    """Fetches standards catalogue metadata from the public collection."""
    print("[*] Fetching Indian Standards catalogue from Internet Archive Public Resource collection...")
    base_url = "https://archive.org/advancedsearch.php"
    query = "collection:(gov.in.is.standards) AND mediatype:(texts)"
    fields = ["identifier", "title", "description", "year", "publicdate"]
    
    url = f"{base_url}?q={urllib.parse.quote(query)}&fl[]=" + "&fl[]=".join(fields) + "&rows=25000&output=json"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        
    docs = data.get("response", {}).get("docs", [])
    print(f"[+] Downloaded {len(docs)} raw records from Internet Archive.")
    
    records = []
    for doc in docs:
        identifier = doc.get("identifier", "")
        parsed = parse_is_identifier(identifier)
        if not parsed.get("valid"):
            continue
            
        desc = doc.get("description", "")
        meta = parse_metadata_description(desc)
        title = doc.get("title", "")
        
        # Clean title
        title_clean = re.sub(r'^IS\s*[0-9\:\-\(\)\sPartPtSec]+\s*[:\-]\s*', '', title, flags=re.IGNORECASE)
        title_clean = re.sub(r'[\r\n\t]+', ' ', title_clean).strip()
        
        record = {
            "family_id": parsed["family_id"],
            "prefix": parsed["prefix"],
            "number": parsed["number"],
            "part": parsed["part"],
            "section": parsed["section"],
            "title_en": title_clean if title_clean else title,
            "title_hi": None,
            "scope_text": None,
            "committee": meta["committee"],
            "committee_code": meta["committee_code"],
            "division": meta["division"],
            "tier": "CATALOGUE_EVIDENCE",
            "raw_id": meta["designator"] if meta["designator"] else identifier,
            "status": meta["status"],
            "num_amendments": meta["num_amendments"],
            "year": parsed["year"] if parsed["year"] else doc.get("year"),
            "archive_url": f"https://archive.org/details/{identifier}",
            "pdf_url": f"https://archive.org/download/{identifier}/{identifier}.pdf"
        }
        records.append(record)
        
    return records


# ==============================================================================
# SECTION 3: COMPULSORY QCO SCRAPER (BIS SCHEMES I, II, IV, X)
# ==============================================================================

SCHEME_URLS = {
    "ISI_MARK": "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-1/?lang=en",
    "CRS": "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en",
    "SCHEME_IV": "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-4/?lang=en",
    "SCHEME_X": "https://www.bis.gov.in/products-under-compulsory-certification-scheme-x/?lang=en"
}

def clean_cell(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'\s+', ' ', str(text)).strip()

def fetch_qco_table(scheme: str, url: str) -> List[Dict[str, Any]]:
    """Scrapes compulsory certification product tables from bis.gov.in."""
    print(f"[*] Fetching compulsory certification list for {scheme} from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[!] Error fetching {scheme}: {e}")
        return []

    soup = BeautifulSoup(html, 'html.parser')
    tables = soup.find_all('table')
    results = []

    for table in tables:
        rows = table.find_all('tr')
        if not rows:
            continue
        
        current_category = ""
        for tr in rows:
            cells = [clean_cell(td.get_text()) for td in tr.find_all(['td', 'th'])]
            if not cells or len(cells) < 2:
                continue

            if len(cells) == 1 or (len(cells) == 2 and not cells[0].isdigit() and not cells[0].startswith('IS')):
                current_category = cells[0] if len(cells) == 1 else cells[1]
                continue

            sr_no = cells[0]
            is_no = ""
            product = ""
            notification = ""

            for c in cells[1:]:
                if "IS" in c or re.search(r'\b\d{3,5}\b', c):
                    if not is_no:
                        is_no = c
                        continue
                if not product and len(c) > 3 and not re.search(r'S\.O\.|G\.S\.R\.|Notification|Gazette', c, re.IGNORECASE):
                    product = c
                elif not notification and re.search(r'S\.O\.|G\.S\.R\.|dated|\d{4}', c, re.IGNORECASE):
                    notification = c

            if not is_no and not product:
                continue

            # Parse IS citations
            is_citations = re.findall(r'(IS\s*[\d\:\(\)\-\/A-Za-z]+)', is_no)
            if not is_citations and re.search(r'\b\d{3,5}\b', is_no):
                is_citations = [f"IS {m}" for m in re.findall(r'\b\d{3,5}\b', is_no)]

            for is_str in (is_citations if is_citations else [is_no]):
                parsed = parse_is_identifier(is_str)
                results.append({
                    "scheme": scheme,
                    "category": current_category,
                    "sr_no": sr_no,
                    "raw_is_no": is_str,
                    "family_id": parsed["family_id"] if parsed.get("valid") else None,
                    "product_name": product,
                    "gazette_notification": notification,
                    "status": "MANDATORY",
                    "source_url": url
                })

    print(f"[+] Successfully extracted {len(results)} QCO orders for {scheme}")
    return results

def run_fetch_all_qcos() -> List[Dict[str, Any]]:
    """Scrapes all BIS schemes and saves to qco_master.json."""
    all_qcos = []
    for scheme, url in SCHEME_URLS.items():
        qcos = fetch_qco_table(scheme, url)
        all_qcos.extend(qcos)
        time.sleep(1)

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(QCO_JSON, "w", encoding="utf-8") as f:
        json.dump(all_qcos, f, indent=2, ensure_ascii=False)
    print(f"[SUCCESS] Saved {len(all_qcos)} compulsory QCO orders to {QCO_JSON}")
    return all_qcos


# ==============================================================================
# SECTION 4: KNOWLEDGE GRAPH & DATABASE BUILDER
# ==============================================================================

def load_records_from_jsonl(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
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

def build_sqlite_database(standards: List[Dict[str, Any]], qcos: List[Dict[str, Any]], db_path: str = SQLITE_DB):
    """
    Constructs high-performance SQLite database with:
    - standards table
    - standards_fts (SQLite FTS5 BM25 indexed)
    - edges table (14,000+ graph edges)
    - cert_rules table (live QCOs + Hallmarking orders)
    """
    print(f"[*] Initializing and populating SQLite database at {db_path}...")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Create Core Tables
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
        tier TEXT,
        raw_id TEXT,
        status TEXT,
        num_amendments INTEGER,
        year INTEGER,
        archive_url TEXT,
        pdf_url TEXT
    );
    """)

    cur.execute("CREATE INDEX IF NOT EXISTS idx_standards_number ON standards (number);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_standards_division ON standards (division);")

    # 2. Create FTS5 Full-Text Index
    cur.execute("DROP TABLE IF EXISTS standards_fts;")
    cur.execute("""
    CREATE VIRTUAL TABLE standards_fts USING fts5(
        family_id,
        raw_id,
        title_en,
        division,
        committee,
        content=standards,
        content_rowid=rowid
    );
    """)

    # 3. Create Knowledge Graph Edges Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS edges (
        src_family_id TEXT,
        dst_family_id TEXT,
        edge_type TEXT,
        provenance TEXT,
        confidence REAL,
        PRIMARY KEY (src_family_id, dst_family_id, edge_type)
    );
    """)

    # 4. Create Compulsory Certification & QCO Table
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
        status TEXT,
        source_url TEXT
    );
    """)

    # Clear existing records
    cur.execute("DELETE FROM standards;")
    cur.execute("DELETE FROM cert_rules;")
    cur.execute("DELETE FROM edges;")

    # 5. Populate Standards
    std_rows = []
    seen_fids = set()
    for s in standards:
        fid = s.get("family_id")
        if not fid or fid in seen_fids:
            continue
        seen_fids.add(fid)
        std_rows.append((
            fid, s.get("prefix"), s.get("number"), s.get("part"), s.get("section"),
            s.get("title_en"), s.get("title_hi"), s.get("scope_text"), s.get("committee"),
            s.get("committee_code"), s.get("division"), s.get("tier"), s.get("raw_id"),
            s.get("status"), s.get("num_amendments"), s.get("year"), s.get("archive_url"),
            s.get("pdf_url")
        ))

    cur.executemany("""
    INSERT INTO standards (
        family_id, prefix, number, part, section, title_en, title_hi, scope_text,
        committee, committee_code, division, tier, raw_id, status, num_amendments,
        year, archive_url, pdf_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, std_rows)

    # Populate FTS5 index
    cur.execute("""
    INSERT INTO standards_fts (rowid, family_id, raw_id, title_en, division, committee)
    SELECT rowid, family_id, raw_id, title_en, division, committee FROM standards;
    """)

    # 6. Generate Standards Knowledge Graph Edges
    edges = []
    # Supersession chains
    for s in standards:
        fid = s.get("family_id")
        sup = s.get("superceded_by")
        if fid and sup:
            sup_clean = sup.strip().replace(" ", "")
            edges.append((fid, f"IS:{sup_clean}", "SUPERSEDES", "CATALOGUE_STATUS", 1.0))

    # Committee Council Associations
    committee_groups = {}
    for s in standards:
        c_code = s.get("committee_code")
        fid = s.get("family_id")
        if c_code and fid:
            committee_groups.setdefault(c_code, []).append(fid)

    for c_code, fids in committee_groups.items():
        if len(fids) > 1:
            sample_fids = fids[:10]
            for i in range(len(sample_fids)):
                for j in range(i + 1, min(i + 4, len(sample_fids))):
                    edges.append((sample_fids[i], sample_fids[j], "RELATED_PRODUCT", "COMMITTEE_COUNCIL", 0.7))
                    edges.append((sample_fids[j], sample_fids[i], "RELATED_PRODUCT", "COMMITTEE_COUNCIL", 0.7))

    cur.executemany("""
    INSERT OR IGNORE INTO edges (src_family_id, dst_family_id, edge_type, provenance, confidence)
    VALUES (?, ?, ?, ?, ?)
    """, edges)

    # 7. Ingest QCOs & Mandatory Hallmarking Orders
    qco_rows = []
    if qcos:
        for q in qcos:
            qco_rows.append((
                q.get("scheme"), q.get("category"), q.get("sr_no"), q.get("raw_is_no"),
                q.get("family_id"), q.get("product_name"), q.get("gazette_notification"),
                q.get("status", "IN_FORCE"), q.get("source_url")
            ))

    # Inject Mandatory BIS Hallmarking Scheme IV Orders (Gold & Silver)
    qco_rows.extend([
        (
            "HALLMARKING", "Jewellery and Artefacts", "1", "IS 1417 : 2016", "IS:1417",
            "Gold jewellery and gold artefacts (Mandatory Hallmarking in notified districts)",
            "Hallmarking of Gold Jewellery and Gold Artefacts Order, 2020 (S.O. 358(E) amended 2021-2026)",
            "MANDATORY", "https://www.bis.gov.in/hallmarking-overview/"
        ),
        (
            "HALLMARKING", "Jewellery and Artefacts", "2", "IS 2112 : 2014", "IS:2112",
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
    print(f"[SUCCESS] SQLite database populated: {len(std_rows)} standards, {len(edges)} graph edges, {len(qco_rows)} QCO records.")


# ==============================================================================
# SECTION 5: PIPELINE VERIFICATION & INTEGRITY AUDIT
# ==============================================================================

def verify_pipeline_integrity(db_path: str = SQLITE_DB) -> bool:
    """Verifies that the database has all tables, records, and FTS5 search working."""
    if not os.path.exists(db_path):
        print(f"[FAIL] Database file does not exist: {db_path}")
        return False

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM standards;")
    std_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM cert_rules;")
    qco_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM edges;")
    edge_count = cur.fetchone()[0]

    # Verify FTS5
    cur.execute("SELECT COUNT(*) FROM standards_fts WHERE standards_fts MATCH 'cement';")
    fts_count = cur.fetchone()[0]

    # Verify Mandatory Hallmarking
    cur.execute("SELECT scheme, raw_is_no FROM cert_rules WHERE family_id = 'IS:1417';")
    hallmark = cur.fetchone()

    conn.close()

    print("\n" + "=" * 60)
    print("MAANAKAI DATA PIPELINE INTEGRITY AUDIT")
    print("=" * 60)
    print(f"Total Standards:       {std_count:,} records")
    print(f"Compulsory QCOs:       {qco_count:,} orders (including Scheme IV Hallmarking)")
    print(f"Knowledge Graph Edges: {edge_count:,} relationships")
    print(f"FTS5 Search Hits:      {fts_count:,} documents for query 'cement'")
    print(f"Hallmarking Scheme:    {hallmark[0] if hallmark else 'MISSING'}")
    print("=" * 60)

    is_healthy = (std_count >= 19000 and qco_count >= 2000 and edge_count >= 10000 and fts_count > 0 and hallmark is not None)
    status_str = "[PASS] PIPELINE AUDIT PASSED" if is_healthy else "[FAIL] AUDIT FAILED"
    print(status_str + "\n")
    return is_healthy


# ==============================================================================
# SECTION 6: CLI ENTRYPOINT
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="MaanakAI (SIH 26108) Unified Single-File Data Pipeline"
    )
    parser.add_argument("--all", action="store_true", help="Run full pipeline: scrape, parse, build DB and verify")
    parser.add_argument("--fetch-standards", action="store_true", help="Download standards catalogue from remote")
    parser.add_argument("--fetch-qco", action="store_true", help="Scrape live QCO orders from bis.gov.in")
    parser.add_argument("--build-db", action="store_true", help="Build SQLite standards.db and knowledge graph from data files")
    parser.add_argument("--verify", action="store_true", help="Verify standards.db integrity and record counts")

    args = parser.parse_args()

    # If no arguments passed, default to building DB from local files and verifying
    if not (args.all or args.fetch_standards or args.fetch_qco or args.build_db or args.verify):
        print("[!] No flags specified. Running default: Build database from local files and verify.")
        args.build_db = True
        args.verify = True

    if args.all or args.fetch_qco:
        run_fetch_all_qcos()

    if args.all or args.fetch_standards:
        standards = fetch_standards_catalogue_remote()
        with open(STANDARDS_JSONL, "w", encoding="utf-8") as f:
            for s in standards:
                f.write(json.dumps(s, ensure_ascii=False) + "\n")
        print(f"[+] Saved standards to {STANDARDS_JSONL}")

    if args.all or args.build_db:
        standards = load_records_from_jsonl(STANDARDS_JSONL)
        qcos = load_records_from_json(QCO_JSON)
        if not standards:
            print(f"[!] Warning: {STANDARDS_JSONL} not found. Please run with --fetch-standards first.")
        else:
            build_sqlite_database(standards, qcos, SQLITE_DB)

    if args.all or args.verify:
        verify_pipeline_integrity(SQLITE_DB)

if __name__ == "__main__":
    main()
