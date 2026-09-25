"""
Fetcher for Indian Standards Catalogue from Internet Archive Public Resource Collection.
Pulls ALL ~22,025 official Indian Standards metadata records in one high-speed batch.
"""

import os
import sys
import json
import re
import time
import csv
import urllib.request
from typing import Dict, Any, List
from data_pipeline.ids import parse_is_identifier

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
OUTPUT_JSONL = os.path.join(DATA_DIR, "standards_master.jsonl")
OUTPUT_CSV = os.path.join(DATA_DIR, "standards_master.csv")

BASE_SEARCH_URL = "https://archive.org/advancedsearch.php"

def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def parse_metadata_description(desc: str) -> Dict[str, Any]:
    """
    Extracts structured fields from the archive.org metadata description.
    """
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
        if val and "decided by council" not in val.lower():
            res["superceded_by"] = val

    return res

def fetch_all_standards() -> List[Dict[str, Any]]:
    os.makedirs(DATA_DIR, exist_ok=True)
    all_standards = []
    
    print("[*] Fetching complete Indian Standards catalogue (22,000+ items) from archive.org...")
    url = (
        f"{BASE_SEARCH_URL}?q=identifier:gov.in.is.*"
        f"&fl[]=identifier,title,description,year,creator,subject,date,downloads"
        f"&rows=25000&output=json"
    )
    
    req = urllib.request.Request(url, headers={'User-Agent': 'IS-Recommender-Engine/1.0'})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"[!] Error fetching dataset: {e}")
        return []

    docs = data.get("response", {}).get("docs", [])
    total_found = data.get("response", {}).get("numFound", len(docs))
    print(f"[*] Successfully downloaded {len(docs)} records (Total in repository: {total_found}) in {time.time()-t0:.2f}s")
    
    print("[*] Parsing structured fields, committees, divisions, and status...")
    t1 = time.time()
    for doc in docs:
        ident = doc.get("identifier", "")
        raw_title = clean_text(doc.get("title", ""))
        desc = doc.get("description", "")
        year = doc.get("year")
        
        parsed_meta = parse_metadata_description(desc)
        
        subjects = [str(s).lower() for s in doc.get("subject", [])]
        if "withdrawn" in subjects:
            parsed_meta["status"] = "WITHDRAWN"
            
        designator = parsed_meta.get("designator") or raw_title.split(":")[0]
        id_info = parse_is_identifier(designator or ident)
        
        clean_title = raw_title
        if ":" in raw_title:
            clean_title = raw_title.split(":", 1)[1].strip()
        
        record = {
            "family_id": id_info.get("family_id"),
            "prefix": id_info.get("prefix", "IS"),
            "number": id_info.get("number"),
            "part": id_info.get("part"),
            "section": id_info.get("section"),
            "raw_id": designator or id_info.get("raw"),
            "title_en": clean_title,
            "year": year or id_info.get("year"),
            "division": parsed_meta.get("division"),
            "committee": parsed_meta.get("committee"),
            "committee_code": parsed_meta.get("committee_code"),
            "num_amendments": parsed_meta.get("num_amendments", 0),
            "status": parsed_meta.get("status", "CURRENT"),
            "superceded_by": parsed_meta.get("superceded_by"),
            "identifier": ident,
            "archive_url": f"https://archive.org/details/{ident}",
            "pdf_url": f"https://archive.org/download/{ident}/{ident}.pdf"
        }
        all_standards.append(record)
        
    print(f"[*] Parsed {len(all_standards)} records in {time.time()-t1:.2f}s")
    
    print(f"[*] Saving master dataset to JSONL: {OUTPUT_JSONL}...")
    with open(OUTPUT_JSONL, "w", encoding="utf-8") as f:
        for item in all_standards:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
            
    print(f"[*] Saving master dataset to CSV: {OUTPUT_CSV}...")
    if all_standards:
        fieldnames = list(all_standards[0].keys())
        with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_standards)
            
    print(f"[SUCCESS] Complete master dataset created! Total standards: {len(all_standards)}")
    return all_standards

if __name__ == "__main__":
    fetch_all_standards()
