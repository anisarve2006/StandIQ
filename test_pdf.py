"""
MaanakAI (मानक AI) — Tender PDF Document Auditor.
Uploads or points to any Government / PSU Tender PDF, parses itemized BoQ tables
and technical specifications, maps applicable Indian Standards (IS), audits
mandatory QCO compliance, and generates a formatted compliance matrix.

Usage:
    python test_pdf.py "path/to/your_tender.pdf"
    or simply:
    python test_pdf.py
"""

import os
import sys
import json
import time

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is in sys.path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from api_service import recommend_tender_pdf 
except ImportError:
    from backend.api_service import recommend_tender_pdf

def print_banner():
    print("\n" + "=" * 80)
    print("🇮🇳  MAANAKAI (मानक AI) — TENDER PDF & BoQ COMPLIANCE AUDITOR")
    print("    Bureau of Indian Standards (BIS) Recommendation Engine")
    print("=" * 80)

def audit_pdf(pdf_path: str, max_items: int = 15):
    clean_path = pdf_path.strip().strip("'\"")
    if not os.path.exists(clean_path):
        print(f"\n[ERROR] File not found: {clean_path}")
        print("Please check the path and try again.\n")
        return

    file_size_kb = os.path.getsize(clean_path) / 1024
    print(f"\n[*] Target PDF:     {os.path.abspath(clean_path)}")
    print(f"[*] File Size:      {file_size_kb:.1f} KB")
    print(f"[*] Parsing layout, extracting BoQ items & auditing standards...")

    t0 = time.time()
    try:
        matrix = recommend_tender_pdf(clean_path, max_items=max_items, top_candidates=3)
    except Exception as e:
        print(f"\n[ERROR] Failed to process PDF: {e}")
        return

    elapsed_s = time.time() - t0

    # Summary
    meta = matrix.get("document_metadata", {})
    summary = matrix.get("compliance_summary", {})
    items = matrix.get("item_recommendations", [])

    print("\n" + "=" * 80)
    print(f"📊 TENDER AUDIT EXECUTIVE SUMMARY (Processed in {elapsed_s:.2f}s)")
    print("=" * 80)
    print(f"• Document Pages:       {meta.get('pages', 'N/A')}")
    print(f"• Total Items Analyzed: {len(items)}")
    print(f"• Mandatory QCO Items:  {summary.get('mandatory_qco_items', 0)} (Legally Enforced under BIS Act)")
    print(f"• Voluntary Items:      {summary.get('voluntary_items', 0)}")
    print(f"• QCO Compliance Ratio: {summary.get('compliance_score', 0)}%")
    print("=" * 80)

    if not items:
        print("\n[!] No itemized specifications or BoQ tables were detected in this document.")
        return

    # Itemized Breakdown
    print("\n" + "-" * 80)
    print("ITEMIZED TENDER SPECIFICATIONS & COMPLIANCE MATRIX")
    print("-" * 80)

    markdown_lines = [
        f"# Tender Compliance Audit Report",
        f"**File:** `{os.path.basename(clean_path)}`  ",
        f"**Pages:** {meta.get('pages', 'N/A')} | **Analyzed Items:** {len(items)} | **Audit Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}  ",
        f"**Mandatory QCO Items:** {summary.get('mandatory_qco_items', 0)} | **Compliance Ratio:** {summary.get('compliance_score', 0)}%  ",
        "",
        "| Item # | Page | Source | Description | Recommended Standard | Status | QCO Order |",
        "|---|---|---|---|---|---|---|"
    ]

    for it in items:
        idx = it.get("item_index")
        page = it.get("page")
        source = it.get("item_source")
        query_snippet = it.get("query_text", "").replace("\n", " ").strip()
        if len(query_snippet) > 65:
            query_snippet = query_snippet[:62] + "..."

        std = it.get("primary_standard", {})
        std_id = std.get("raw_id", "N/A")
        std_title = std.get("title_en", "N/A")
        status = std.get("status", "CURRENT")

        cert = it.get("certification", {})
        is_mand = cert.get("is_mandatory", False)
        scheme = cert.get("scheme", "")
        qco_label = f"⚠️ MANDATORY ({scheme})" if is_mand else "VOLUNTARY"

        print(f"\n[Item {idx}] Page {page} ({source}):")
        print(f"  📝 Specification:    \"{query_snippet}\"")
        print(f"  🎯 Recommended IS:   {std_id} — {std_title}")
        print(f"  🏷️ Status:           {status}  |  Confidence: {std.get('confidence_label', 'HIGH')}")
        print(f"  ⚖️ Certification:    [{qco_label}]")
        
        # Specification gaps
        gaps = it.get("specification_gaps", [])
        if gaps:
            print(f"  ⚠️ Missing In Tender:")
            for g in gaps:
                print(f"     • {g}")

        markdown_lines.append(
            f"| {idx} | {page} | {source} | {query_snippet} | **{std_id}** ({std_title[:40]}...) | {status} | {qco_label} |"
        )

    # Save Markdown Audit Report
    report_file = os.path.splitext(os.path.basename(clean_path))[0] + "_audit_report.md"
    report_path = os.path.join(os.getcwd(), report_file)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(markdown_lines))

    print("\n" + "=" * 80)
    print(f"💾 Full audit report successfully saved to:\n👉 {report_path}")
    print("=" * 80 + "\n")

def main():
    print_banner()

    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        print("\nYou can either:")
        print("1. Drag and drop your PDF file into this terminal window.")
        print("2. Type or paste the full path to your PDF file.")
        print("3. Press Enter to use the default sample GeM tender PDF.\n")
        pdf_path = input("Enter PDF file path: ").strip()

        if not pdf_path:
            sample = os.path.join("data", "sample_gem_tender.pdf")
            if os.path.exists(sample):
                pdf_path = sample
                print(f"[*] Using default sample: {sample}")
            else:
                print("[ERROR] No path provided.")
                return

    audit_pdf(pdf_path)

if __name__ == "__main__":
    main()
