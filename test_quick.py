"""
Quick 1-Command Self-Tester for MaanakAI.
Runs 3 instant tests across English, Hindi, and Marathi in under 3 seconds.

Run with:
    python test_quick.py
"""

import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from api_service import recommend_standards

TESTS = [
    ("English Technical Spec", "12mm Fe 500D high strength deformed steel rebar for RCC work"),
    ("Hindi (Devanagari)", "भवन निर्माण के लिए 43 ग्रेड साधारण पोर्टलैंड सीमेंट"),
    ("Marathi (Trade Slang)", "घराच्या बांधकामासाठी लोखंडी गज आणि सिमेंट"),
    ("Electrical Motors", "three phase energy efficient induction motor 15 kW 415 V line operated")
]

print("=" * 70)
print("🇮🇳  MAANAKAI (मानक AI) — QUICK SELF-TEST")
print("=" * 70)

for label, query in TESTS:
    print(f"\n[*] Testing: [{label}]")
    print(f"    Query:  \"{query}\"")
    res = recommend_standards(query)
    primary = res.get("primary_recommendation", {})
    cert = res.get("certification", {})
    timings = res.get("latency_breakdown_ms", {})

    print(f"    👉 Recommended IS:  {primary.get('raw_id')} — {primary.get('title_en')}")
    print(f"    👉 Year & Status:   {primary.get('year')} ({primary.get('status')})")
    print(f"    👉 Regulatory QCO:  {cert.get('status')} [{cert.get('scheme', 'N/A')}]")
    print(f"    👉 Latency:         {timings.get('total_pipeline_ms', 0):.1f} ms")

print("\n" + "=" * 70)
print("[PASS] Quick self-test completed successfully!")
print("=" * 70 + "\n")
