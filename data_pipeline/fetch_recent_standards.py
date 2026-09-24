"""
Fetcher & Reconciler for 2024-2026 Indian Standards & Gazette QCO Updates.
Extracts modern 2024-2026 standard editions and QCO mandates, updating standards.db & CSV.
"""

import os
import json
import sqlite3
import re
from typing import List, Dict, Any
from data_pipeline.ids import parse_is_identifier

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
QCO_JSON = os.path.join(DATA_DIR, "qco_master.json")
SQLITE_DB = os.path.join(DATA_DIR, "standards.db")
STANDARDS_JSONL = os.path.join(DATA_DIR, "standards_master.jsonl")
STANDARDS_CSV = os.path.join(DATA_DIR, "standards_master.csv")

def extract_recent_standards_from_qco() -> List[Dict[str, Any]]:
    if not os.path.exists(QCO_JSON):
        print(f"[!] QCO file not found: {QCO_JSON}")
        return []

    with open(QCO_JSON, "r", encoding="utf-8") as f:
        qcos = json.load(f)

    recent_standards = []
    seen_fids = set()

    print("[*] Scanning QCO registry for 2024-2026 notified standards...")
    for q in qcos:
        raw_is = q.get("raw_is_no", "")
        product = q.get("product_name", "")
        category = q.get("category", "")
        gazette = q.get("gazette_notification", "")
        scheme = q.get("scheme", "")

        # Look for 2024, 2025, 2026 in the standard number or gazette
        is_2024_plus = False
        std_year = None
        
        # Check year in standard number e.g. IS 2083:2024 or IS 17043 (Part-1): 2024
        year_match = re.search(r':\s*(202[4-6])', raw_is)
        if year_match:
            is_2024_plus = True
            std_year = int(year_match.group(1))
        else:
            # Check if gazette order was issued in 2024, 2025, 2026
            gaz_year_match = re.search(r'\b(202[4-6])\b', gazette)
            if gaz_year_match:
                is_2024_plus = True
                std_year = int(gaz_year_match.group(1))

        if not is_2024_plus:
            continue

        id_info = parse_is_identifier(raw_is)
        fid = id_info.get("family_id")
        if not fid or fid in seen_fids:
            continue
        seen_fids.add(fid)

        recent_standards.append({
            "family_id": fid,
            "prefix": id_info.get("prefix", "IS"),
            "number": id_info.get("number"),
            "part": id_info.get("part"),
            "section": id_info.get("section"),
            "raw_id": raw_is,
            "title_en": product or raw_is,
            "year": std_year,
            "division": category or "Mandatory QCO Enforced",
            "committee": "BIS Standards Committee (Live Gazetted)",
            "committee_code": "QCO",
            "num_amendments": 0,
            "status": "CURRENT",
            "superceded_by": None,
            "scheme": scheme,
            "gazette": gazette,
            "source": "BIS Gazette QCO Order"
        })

    print(f"[OK] Extracted {len(recent_standards)} active 2024-2026 standards from QCO notifications.")
    return recent_standards

def merge_recent_standards(recent_standards: List[Dict[str, Any]]):
    if not recent_standards:
        return

    print("[*] Merging 2024-2026 standards into SQLite database...")
    conn = sqlite3.connect(SQLITE_DB)
    cur = conn.cursor()

    inserted = 0
    updated = 0

    for s in recent_standards:
        fid = s["family_id"]
        cur.execute("SELECT year, status FROM standards WHERE family_id = ?", (fid,))
        row = cur.fetchone()

        if row:
            # Update existing standard with latest 2024-2026 edition and CURRENT status
            cur.execute("""
            UPDATE standards 
            SET year = ?, status = 'CURRENT', raw_id = ?
            WHERE family_id = ?
            """, (s["year"], s["raw_id"], fid))
            updated += 1
        else:
            # Insert brand new standard published in 2024-2026
            cur.execute("""
            INSERT INTO standards (
                family_id, prefix, number, part, section, title_en, scope_text,
                committee, committee_code, division, tier, raw_id, status,
                num_amendments, year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                fid, s["prefix"], s["number"], s["part"], s["section"],
                s["title_en"], f"Mandatory compliance standard under {s['scheme']} QCO order.",
                s["committee"], s["committee_code"], s["division"],
                "CATALOGUE_EVIDENCE", s["raw_id"], s["status"],
                s["num_amendments"], s["year"]
            ))
            # Also insert into FTS
            cur.execute("""
            INSERT INTO standards_fts (family_id, raw_id, title_en, division, committee)
            VALUES (?, ?, ?, ?, ?)
            """, (fid, s["raw_id"], s["title_en"], s["division"], s["committee"]))
            inserted += 1

    conn.commit()
    conn.close()
    print(f"[SUCCESS] Database updated with 2024-2026 data: {inserted} new standards inserted, {updated} existing standards updated to latest 2024-2026 editions.")

def run_update():
    recent = extract_recent_standards_from_qco()
    merge_recent_standards(recent)

if __name__ == "__main__":
    run_update()
