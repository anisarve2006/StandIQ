"""
Fetcher for BIS Products under Compulsory Certification & Quality Control Orders (QCOs).
Scrapes Scheme-I (ISI Mark), Scheme-II (CRS), Scheme-IV, Scheme-X from bis.gov.in.
"""

import os
import json
import re
import urllib.request
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from data_pipeline.ids import parse_is_identifier

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
OUTPUT_QCO_JSON = os.path.join(DATA_DIR, "qco_master.json")

SCHEME_URLS = {
    "ISI_MARK": "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-1/?lang=en",
    "CRS": "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en",
    "SCHEME_IV": "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-4/?lang=en",
    "SCHEME_X": "https://www.bis.gov.in/products-under-compulsory-certification-scheme-x/?lang=en"
}

def clean_cell(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def fetch_qco_table(scheme: str, url: str) -> List[Dict[str, Any]]:
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

            # Check if this row is a category header (e.g., 'Cement (any variety of cement...)')
            if len(cells) == 1 or (len(cells) == 2 and not cells[0].isdigit() and not cells[0].startswith('IS')):
                current_category = cells[0] if len(cells) == 1 else cells[1]
                continue

            # Table row structure: [Sr No, IS No, Product, Notification Details]
            # or: [Sr No, Product, IS No, Notification Details]
            sr_no = ""
            is_no_raw = ""
            product = ""
            gazette_ref = ""

            if len(cells) >= 3:
                # Detect which cell contains the IS Number
                if any(x in cells[1].upper() for x in ['IS ', 'IS:', 'IS/']):
                    sr_no = cells[0]
                    is_no_raw = cells[1]
                    product = cells[2]
                    gazette_ref = cells[3] if len(cells) > 3 else ""
                elif any(x in cells[2].upper() for x in ['IS ', 'IS:', 'IS/']):
                    sr_no = cells[0]
                    product = cells[1]
                    is_no_raw = cells[2]
                    gazette_ref = cells[3] if len(cells) > 3 else ""
                else:
                    # Generic fallback
                    sr_no = cells[0]
                    is_no_raw = cells[1]
                    product = cells[2]

            if not is_no_raw or is_no_raw.lower() in ['is no.', 'is no', 'standard']:
                continue

            id_info = parse_is_identifier(is_no_raw)
            results.append({
                "scheme": scheme,
                "category": current_category,
                "sr_no": sr_no,
                "raw_is_no": is_no_raw,
                "family_id": id_info.get("family_id"),
                "product_name": product,
                "gazette_notification": gazette_ref,
                "status": "IN_FORCE",
                "source_url": url
            })

    print(f"[OK] Extracted {len(results)} mandatory standards under {scheme}")
    return results

def fetch_all_qcos() -> List[Dict[str, Any]]:
    os.makedirs(DATA_DIR, exist_ok=True)
    all_qco_items = []
    
    for scheme, url in SCHEME_URLS.items():
        items = fetch_qco_table(scheme, url)
        all_qco_items.extend(items)

    print(f"[*] Total compulsory certification records scraped: {len(all_qco_items)}")
    with open(OUTPUT_QCO_JSON, "w", encoding="utf-8") as f:
        json.dump(all_qco_items, f, indent=2, ensure_ascii=False)
        
    print(f"[OK] Saved QCO registry to {OUTPUT_QCO_JSON}")
    return all_qco_items

if __name__ == "__main__":
    fetch_all_qcos()
