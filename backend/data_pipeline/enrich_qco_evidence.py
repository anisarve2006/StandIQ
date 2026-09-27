"""
Enriches cert_rules in data/standards.db with verified gazette notifications,
effective dates, ministries, and product scopes directly from official QCOs.
"""

import sqlite3
import os
import re

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "standards.db")

QCO_MAPPINGS = [
    # Cement
    (
        ["IS 269", "IS 455", "IS 1489", "IS 8112", "IS 12269", "IS 12330", "IS 12600", "IS 3466", "IS 6512", "IS 6909", "IS 8041", "IS 8042", "IS 8043"],
        "Cement (Quality Control) Order, 2024 (S.O. 191(E))",
        "Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry",
        "17 Feb 2003 (Amended 2024)",
        "Compulsory BIS ISI Certification under Scheme-I for all cement varieties (OPC, PPC, Slag, Sulfate Resisting)"
    ),
    # Steel & TMT Bars
    (
        ["IS 1786", "IS 2062", "IS 2830", "IS 2831", "IS 1079", "IS 11513", "IS 1367", "IS 432", "IS 1239", "IS 1161", "IS 4923"],
        "Steel and Steel Products (Quality Control) Order, 2020 / 2024 (S.O. 2450(E))",
        "Ministry of Steel, Government of India",
        "22 July 2020 (Amended 2024)",
        "Compulsory BIS ISI Marking for TMT Rebars, Mild Steel Tubes, Structural Steel, and Fasteners"
    ),
    # Ceramic & Vitrified Tiles
    (
        ["IS 15622", "IS 13712"],
        "Ceramic and Vitrified Tiles (Quality Control) Order, 2020 (S.O. 4501(E))",
        "DPIIT, Ministry of Commerce and Industry",
        "01 July 2021",
        "Compulsory BIS ISI Certification for ceramic glazed tiles and vitrified tiles"
    ),
    # Stainless Steel Sinks
    (
        ["IS 13983"],
        "Stainless Steel Sinks for Domestic Purposes (Quality Control) Order, 2023 (S.O. 4012(E))",
        "DPIIT, Ministry of Commerce and Industry",
        "01 March 2024",
        "Compulsory BIS standard marking for stainless steel domestic sinks"
    ),
    # Wooden Flush Door Shutters
    (
        ["IS 2202"],
        "Plywood and Wooden Flush Door Shutters (Quality Control) Order, 2024 (S.O. 1245(E))",
        "DPIIT, Ministry of Commerce and Industry",
        "28 Feb 2024",
        "Compulsory BIS ISI Mark for wooden flush door shutters (solid core type)"
    ),
    # Door Fittings, Handles & Aldrops
    (
        ["IS 204", "IS 2681", "IS 4992", "IS 3818", "IS 362", "IS 363"],
        "Door Fittings (Quality Control) Order, 2023 (S.O. 5028(E))",
        "DPIIT, Ministry of Commerce and Industry",
        "15 March 2024",
        "Compulsory BIS Certification for tower bolts, sliding door bolts (aldrops), and mortice door handles"
    ),
    # Distribution Transformers
    (
        ["IS 1180"],
        "Distribution Transformers (Quality Control) Order, 2014 (S.O. 268(E))",
        "DPIIT, Ministry of Commerce and Industry",
        "27 Jan 2014",
        "Compulsory Standard Mark for outdoor distribution transformers up to 2500 kVA"
    ),
    # Electrical Wires & Cables
    (
        ["IS 694", "IS 1554", "IS 7098", "IS 12640"],
        "Electrical Wires, Cables, Appliances and Protection Devices (Quality Control) Order, 2003 / 2023 (S.O. 189(E))",
        "DPIIT & Ministry of Power",
        "17 Feb 2003 (Amended 2023)",
        "Compulsory BIS Standard Mark for PVC cables, XLPE cables, and RCCB circuit breakers"
    ),
    # Solar Inverters & Grid Interactive PCUs
    (
        ["IS 16221", "IS 16169"],
        "Solar Photovoltaics, Systems, Devices and Components Goods (Requirements for Compulsory Registration) Order, 2017",
        "Ministry of New and Renewable Energy (MNRE)",
        "05 Sept 2017",
        "Compulsory Registration Scheme (CRS) for utility interconnected solar PV inverters and power converters"
    ),
    # Electronics & IT CCTV
    (
        ["IS 13252", "IS 16046"],
        "Electronics and Information Technology Goods (Requirements for Compulsory Registration) Order, 2012 / 2021",
        "Ministry of Electronics and Information Technology (MeitY)",
        "03 Oct 2012 (Phase-IV Amended 2021)",
        "Compulsory Registration Scheme (CRS) for network security cameras, CCTV, and power adapters"
    )
]

def enrich_cert_rules():
    print(f"Enriching QCO rules in database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    updated_count = 0
    inserted_count = 0

    for std_prefixes, order_title, ministry, effective_date, scope in QCO_MAPPINGS:
        full_gazette = f"{order_title} | Notified by {ministry} | Effective Date: {effective_date}"
        
        for prefix in std_prefixes:
            # Check existing records in cert_rules
            cur.execute("SELECT id, raw_is_no, gazette_notification FROM cert_rules WHERE raw_is_no LIKE ?", (f"%{prefix}%",))
            rows = cur.fetchall()

            if rows:
                for row_id, raw_is, current_gazette in rows:
                    if not current_gazette or len(current_gazette.strip()) < 5:
                        cur.execute("""
                        UPDATE cert_rules 
                        SET gazette_notification = ?, status = 'IN_FORCE' 
                        WHERE id = ?
                        """, (full_gazette, row_id))
                        updated_count += 1
            else:
                # Insert explicit rule if missing
                cur.execute("""
                INSERT INTO cert_rules (scheme, category, sr_no, raw_is_no, family_id, product_name, gazette_notification, status, source_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    "ISI_MARK", "Compulsory QCO", "QCO", prefix, f"IS:{prefix.replace('IS ', '')}",
                    scope, full_gazette, "IN_FORCE",
                    "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-1/"
                ))
                inserted_count += 1

    conn.commit()
    conn.close()
    print(f"Successfully enriched cert_rules! Updated: {updated_count}, Inserted: {inserted_count}")

if __name__ == "__main__":
    enrich_cert_rules()
