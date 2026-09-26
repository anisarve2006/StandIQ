"""
MaanakAI (मानक AI) — Interactive Self-Testing Tool.
Allows users to quickly test queries across English, Indic languages, trade slang,
or full tender PDF documents with zero setup.

Run with:
    python test_interactive.py
"""

import sys
import os
import json
import time

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
# Ensure backend directory is in sys.path when running from workspace root
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from api_service import recommend_standards, recommend_tender_pdf
except ImportError:
    from backend.api_service import recommend_standards, recommend_tender_pdf

PRESET_TESTS = [
    {
        "category": "Civil & Construction (English)",
        "query": "Fe 500D thermo mechanically treated high strength deformed steel rebar for RCC slab construction 12mm",
        "description": "Tests high-strength rebar parameter extraction (12mm, Fe 500D) and QCO ISI mark."
    },
    {
        "category": "Indian Trade Vernacular (Hinglish)",
        "query": "ghar banane ke liye 12mm sariya aur 43 grade cement chahiye",
        "description": "Tests informal colloquial trade slang ('sariya', 'ghar banane ke liye')."
    },
    {
        "category": "Hindi (Devanagari)",
        "query": "भवन निर्माण के लिए 12mm सरिया Fe 500D एवं साधारण पोर्टलैंड सीमेंट",
        "description": "Tests native Devanagari Hindi NLP with Entity Guard."
    },
    {
        "category": "Tamil (தமிழ்)",
        "query": "கட்டிட வேலைக்கான சிமெண்ட் மற்றும் கம்பி",
        "description": "Tests Dravidian Tamil script with cross-lingual mapping."
    },
    {
        "category": "Marathi (मराठी)",
        "query": "घराच्या बांधकामासाठी लोखंडी गज आणि सिमेंट",
        "description": "Tests Marathi construction trade terminology ('लोखंडी गज')."
    },
    {
        "category": "Electrical & Motors",
        "query": "three phase energy efficient induction motor 15 kW 415 V 50 Hz line operated",
        "description": "Tests electrical constraints (15 kW, 415 V, 50 Hz) and IE efficiency classes."
    },
    {
        "category": "Electronics & Mandatory CRS Scheme",
        "query": "laptop notebook computers with power adapter for office workstation",
        "description": "Tests MeitY Compulsory Registration Scheme (CRS) regulatory orders."
    },
    {
        "category": "Gold Jewellery & Mandatory Hallmarking",
        "query": "gold jewellery and gold artefacts 22 karat fineness marking",
        "description": "Tests BIS Scheme IV Mandatory Hallmarking order (IS 1417)."
    }
]

def print_banner():
    print("\n" + "=" * 75)
    print("🇮🇳  MAANAKAI (मानक AI) — INTERACTIVE SELF-TESTING SUITE")
    print("    Bureau of Indian Standards (BIS) Recommender Engine")
    print("=" * 75)

def display_result(res: dict):
    primary = res.get("primary_recommendation")
    if not primary:
        print("\n[!] No matching Indian Standard found with sufficient confidence.")
        return

    print("\n" + "-" * 75)
    print(f"🎯 PRIMARY RECOMMENDED STANDARD:")
    print(f"   • Standard ID:     {primary.get('raw_id')} ({primary.get('family_id')})")
    print(f"   • Title:           {primary.get('title_en')}")
    print(f"   • Publication Yr:  {primary.get('year')}  |  Status: {primary.get('status')}")
    print(f"   • Division:        {primary.get('division')}")
    if primary.get('pdf_url'):
        print(f"   • Official PDF:    {primary.get('pdf_url')}")

    # Confidence breakdown
    conf = primary.get("confidence", {})
    print(f"\n📊 CALIBRATED CONFIDENCE: [{conf.get('overall_label', 'HIGH')}]")
    print(f"   • Semantic Match:      {conf.get('semantic_match', 0.0) * 100:.0f}%")
    print(f"   • Technical Match:     {conf.get('technical_match', 0.0) * 100:.0f}%")
    print(f"   • Graph Support:       {conf.get('graph_support', 0.0) * 100:.0f}%")
    print(f"   • Regulatory Grounding:{conf.get('certification_evidence', 0.0) * 100:.0f}%")

    # QCO Certification
    cert = res.get("certification", {})
    qco_badge = "MANDATORY COMPLIANCE" if cert.get("is_mandatory") else "VOLUNTARY STANDARD"
    print(f"\n⚖️  REGULATORY STATUS: [{qco_badge}]")
    if cert.get("scheme"):
        print(f"   • Applicable Scheme:   {cert.get('scheme')}")
    for order in cert.get("orders", [])[:2]:
        print(f"   • Gazette Order:       {order.get('gazette_notification', 'Notified in Gazette')}")

    # Allied Standards from Graph
    allied = res.get("allied_standards", {})
    test_methods = allied.get("test_methods", [])
    safety_codes = allied.get("safety_standards", [])
    if test_methods or safety_codes:
        print(f"\n🔗 NORMATIVE ALLIED STANDARDS (FROM KNOWLEDGE GRAPH):")
        for t in test_methods[:2]:
            print(f"   • [TEST METHOD]     {t.get('raw_id')}: {t.get('title_en')}")
        for s in safety_codes[:2]:
            print(f"   • [SAFETY STANDARD] {s.get('raw_id')}: {s.get('title_en')}")

    # Latency Breakdown
    timings = res.get("latency_breakdown_ms", {})
    total_ms = timings.get("total_pipeline_ms", 0.0)
    print(f"\n⚡ LATENCY BREAKDOWN: {total_ms:.1f} ms (CPU Inference)")
    print("-" * 75)

def run_pdf_audit_test():
    sample_pdf = os.path.join("data", "sample_gem_tender.pdf")
    if not os.path.exists(sample_pdf):
        print(f"[!] Sample PDF not found at {sample_pdf}")
        return

    print(f"\n[*] Auditing Tender PDF: {sample_pdf}...")
    t0 = time.time()
    matrix = recommend_tender_pdf(sample_pdf, max_items=5)
    elapsed = (time.time() - t0) * 1000

    print("\n" + "=" * 75)
    print(f"📄 TENDER PDF AUDIT MATRIX (Processed in {elapsed:.0f} ms)")
    print("=" * 75)
    summary = matrix.get("compliance_summary", {})
    print(f"• Document Name:      {matrix.get('document_name')}")
    print(f"• Items Audited:      {summary.get('total_items')}")
    print(f"• Fully Compliant:    {summary.get('compliant_items')}")
    print(f"• Mandatory QCO Items:{summary.get('mandatory_qco_items')}")
    print(f"• Compliance Score:   {summary.get('compliance_score')}")

    print("\nItemized Breakdown:")
    for it in matrix.get("item_compliance", []):
        qco_flag = "⚠️ MANDATORY QCO" if it.get("mandatory_qco") else "VOLUNTARY"
        print(f"  [Item {it.get('item_no')}] {it.get('description')[:40]}... -> {it.get('primary_standard')} ({qco_flag})")
    print("=" * 75)

def main():
    print_banner()

    while True:
        print("\nChoose how you want to test:")
        print("  [1] Run Preset Procurement Examples (English, Indic, Electrical, Medical)")
        print("  [2] Type Your Own Custom Query (Natural Language / Slang / Indic)")
        print("  [3] Audit a Sample Tender PDF (BoQ Table Extraction)")
        print("  [4] Run the Complete 60-Case Gold Benchmark Suite")
        print("  [0] Exit")

        choice = input("\nEnter choice [0-4]: ").strip()

        if choice == "0":
            print("\nExiting. Good luck with your project! 🚀\n")
            break

        elif choice == "1":
            print("\nSelect a preset example:")
            for i, p in enumerate(PRESET_TESTS, 1):
                print(f"  [{i}] {p['category']}")
                print(f"      Query: \"{p['query']}\"")

            sub_choice = input(f"\nSelect preset [1-{len(PRESET_TESTS)}]: ").strip()
            try:
                idx = int(sub_choice) - 1
                if 0 <= idx < len(PRESET_TESTS):
                    selected = PRESET_TESTS[idx]
                    print(f"\n[*] Executing Test: {selected['category']}")
                    print(f"[*] Query: \"{selected['query']}\"")
                    res = recommend_standards(selected['query'])
                    display_result(res)
                else:
                    print("[!] Invalid selection.")
            except ValueError:
                print("[!] Please enter a valid number.")

        elif choice == "2":
            user_q = input("\nEnter your product description or tender requirement:\n> ").strip()
            if not user_q:
                print("[!] Query cannot be empty.")
                continue

            print(f"\n[*] Analyzing: \"{user_q}\"...")
            res = recommend_standards(user_q)
            display_result(res)

        elif choice == "3":
            run_pdf_audit_test()

        elif choice == "4":
            print("\n[*] Starting 60-Case Benchmark Suite across 17 BIS divisions...")
            try:
                from eval.benchmark import run_benchmark
            except ImportError:
                from backend.eval.benchmark import run_benchmark
            run_benchmark()

        else:
            print("[!] Invalid option. Please enter 0, 1, 2, 3, or 4.")

if __name__ == "__main__":
    main()
