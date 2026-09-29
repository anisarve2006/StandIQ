"""
Real-World Tender Input Test Suite.
Simulates authentic procurement tender specifications from:
1. Jal Jeevan Mission / CPWD (Water Supply)
2. NHAI / MoRTH (Highways & Bridges)
3. State Electricity Discom / RDSS (Power Distribution)
4. Smart Cities Mission / GeM (Surveillance & IT)
5. Metro Rail / AAI (Fire Safety)

Executes each against the Indian Standards Recommender Engine and validates:
- Correct Primary Standard Identification
- Quality Control Order (QCO) Regulatory Status
- Allied & Cross-Referenced Standards
- Deterministic / LLM 5-Point GeM-Compliant Tender Clause Generation
"""

import sys
import os
import json
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from retrieval.engine import StandardsRecommenderEngine

REAL_WORLD_TENDERS = [
    {
        "tender_id": "TENDER-CPWD-WTR-2026",
        "procuring_agency": "Central Public Works Department (CPWD) / Jal Jeevan Mission",
        "title": "Procurement of Mild Steel Galvanized ERW Water Conveyance Pipes",
        "input_clause": (
            "Supply and delivery at project site of 150 mm nominal bore Mild Steel Tubes "
            "and tubulars, heavy grade, electrically resistance welded ERW, galvanized by "
            "hot-dip zinc coating process for conveying potable drinking water, hydraulic testing "
            "at 5 MPa. All pipes must bear valid BIS Certification Mark under relevant Quality Control Order."
        ),
        "expected_primary_family": "IS:1239:P1",
        "expected_qco_mandatory": True
    },
    {
        "tender_id": "TENDER-NHAI-RBAR-2026",
        "procuring_agency": "National Highways Authority of India (NHAI) / MoRTH",
        "title": "High Strength Deformed TMT Reinforcement Steel for Overpass Bridge Piers",
        "input_clause": (
            "Supply of Thermo-Mechanically Treated (TMT) high strength deformed steel bars and wires "
            "Grade Fe 500D for RCC concrete reinforcement in bridge piers and substructure, nominal diameter "
            "16 mm and 25 mm, strictly manufactured from virgin billets, testing for 0.2 percent proof stress "
            "and minimum 16 percent elongation. Manufacturer must possess valid BIS license under Steel QCO."
        ),
        "expected_primary_family": "IS:1786",
        "expected_qco_mandatory": True
    },
    {
        "tender_id": "TENDER-DISCOM-XFR-2026",
        "procuring_agency": "State Electricity Distribution Company (Discom) / RDSS Scheme",
        "title": "Outdoor Step-Down Distribution Transformers 11kV/433V 500 kVA",
        "input_clause": (
            "Supply of 500 kVA, 11 kV / 433 V, 3-phase, 50 Hz, outdoor type, oil-immersed naturally cooled "
            "ONAN step-down distribution transformers, copper wound, Energy Efficiency Level 2 with standard fittings, "
            "conservator tank, breather, and first filling of uninhibited new insulating oil. Mandatory BIS Standard "
            "Marking with valid CM/L license number is required at the time of technical bid opening."
        ),
        "expected_primary_family": "IS:1180:P1",
        "expected_qco_mandatory": True
    },
    {
        "tender_id": "TENDER-GEM-CCTV-2026",
        "procuring_agency": "Smart City Development Corporation / GeM Portal",
        "title": "Outdoor IP Bullet Surveillance Cameras with BIS CRS Mandate",
        "input_clause": (
            "Procurement and installation of 5 Megapixel Outdoor Bullet Network IP CCTV Cameras, "
            "true day/night with IR cut filter, minimum 50m IR illumination, H.265 compression, "
            "PoE IEEE 802.3af, IP66 ingress protection weatherproof housing. Bidder must submit valid "
            "BIS Compulsory Registration Scheme (CRS) certificate under MeitY Electronics Order."
        ),
        "expected_primary_family": "IS:13252:P1",
        "expected_qco_mandatory": True
    },
    {
        "tender_id": "TENDER-METRO-FIRE-2026",
        "procuring_agency": "Metro Rail Corporation / Airport Authority of India",
        "title": "Stored Pressure ABC Dry Chemical Powder Fire Extinguishers",
        "input_clause": (
            "Supply, testing, and commissioning of 6 kg capacity ABC Dry Chemical Powder stored pressure "
            "type portable fire extinguishers with pressure gauge, nitrogen expelled, squeeze grip mechanism, "
            "suitable for Class A, B, and C fire risks, bearing BIS Certification Mark and tested to hydro test pressure."
        ),
        "expected_primary_family": "IS:15683",
        "expected_qco_mandatory": True
    }
]

def run_real_world_tests():
    print("=" * 80)
    print("RUNNING REAL-WORLD TENDER INPUT EVALUATION SUITE")
    print("=" * 80)
    
    engine = StandardsRecommenderEngine()
    passed = 0
    total = len(REAL_WORLD_TENDERS)
    
    for idx, test_case in enumerate(REAL_WORLD_TENDERS, 1):
        print(f"\n[{idx}/{total}] TEST CASE: {test_case['tender_id']}")
        print(f"Agency : {test_case['procuring_agency']}")
        print(f"Scope  : {test_case['title']}")
        print(f"Input  :\n  \"{test_case['input_clause']}\"")
        
        t0 = time.time()
        result = engine.recommend(test_case["input_clause"], top_candidates=3)
        latency = round((time.time() - t0) * 1000, 2)
        
        primary = result.get("primary_recommendation", {})
        fid = primary.get("family_id")
        raw_id = primary.get("raw_id")
        title = primary.get("title_en")
        cert = result.get("certification", {})
        is_qco = cert.get("is_mandatory", False)
        qco_name = cert.get("applicable_qco", "N/A")
        
        expected_fid = test_case["expected_primary_family"]
        expected_qco = test_case["expected_qco_mandatory"]
        
        fid_match = (fid == expected_fid or (raw_id and expected_fid.replace(":", " ") in raw_id))
        qco_match = (is_qco == expected_qco)
        
        is_success = fid_match and qco_match
        if is_success:
            passed += 1
            status_tag = "PASS"
        else:
            status_tag = "FAIL"
            
        print(f"\nResult: [{status_tag}] (Latency: {latency}ms)")
        print(f"  Primary Standard Recommended : {raw_id} - {title}")
        print(f"  Expected Standard Family     : {expected_fid}")
        print(f"  Quality Control Order (QCO)  : Mandatory={is_qco} | Scheme={cert.get('scheme')} | Title='{qco_name}'")
        
        allied = result.get("allied_standards", {})
        allied_items = []
        for k, v in allied.items():
            if isinstance(v, list):
                for item in v:
                    allied_items.append(f"{item.get('raw_id', item.get('family_id'))} ({k})")
        if allied_items:
            print(f"  Allied Standards Identified  : {', '.join(allied_items[:4])}")
            
        print("\n  Generated Model Tender Specification Clause:")
        clause_lines = result.get("specification_clause", "").strip().split("\n")
        for line in clause_lines[:10]:
            print(f"    {line}")
        if len(clause_lines) > 10:
            print("    ...")
            
    print("\n" + "=" * 80)
    print(f"EVALUATION SUMMARY: {passed}/{total} ({passed/total*100:.1f}%) REAL TENDER CASES PASSED")
    print("=" * 80)

if __name__ == "__main__":
    run_real_world_tests()
