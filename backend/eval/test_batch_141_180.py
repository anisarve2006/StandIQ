import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_141_180 = [
    (141, "AAC block masonry"),
    (142, "Autoclaved aerated concrete blocks"),
    (143, "Concrete hollow blocks"),
    (144, "Solid concrete masonry blocks"),
    (145, "Fly ash cement blocks"),
    (146, "Laterite stone masonry"),
    (147, "Random rubble masonry"),
    (148, "Coursed rubble masonry"),
    (149, "Ashlar stone masonry"),
    (150, "Dry stone masonry"),
    (151, "Brick masonry in cement mortar 1:6"),
    (152, "Brick masonry in cement mortar 1:4"),
    (153, "Half-brick masonry partition wall"),
    (154, "Reinforced brick masonry"),
    (155, "Brick lintels"),
    (156, "Precast concrete lintels"),
    (157, "Stone masonry retaining wall"),
    (158, "Cement plaster 12 mm thick"),
    (159, "Cement plaster 15 mm thick"),
    (160, "Cement plaster 20 mm thick"),
    (161, "Internal smooth plaster"),
    (162, "External cement plaster"),
    (163, "Roughcast plaster finish"),
    (164, "Pebble dash plaster finish"),
    (165, "Cement render to external walls"),
    (166, "Lime plaster"),
    (167, "Gypsum board partition"),
    (168, "Gypsum board false ceiling"),
    (169, "Mineral fibre ceiling tiles"),
    (170, "Aluminium false ceiling panels"),
    (171, "Cement screed flooring"),
    (172, "IPS flooring"),
    (173, "Terrazzo flooring"),
    (174, "Cement concrete flooring"),
    (175, "Marble flooring"),
    (176, "Granute flooring" if False else "Granite flooring"),
    (177, "Kota stone flooring"),
    (178, "Ceramic tile flooring"),
    (179, "Porcelain tile flooring"),
    (180, "Anti-skid floor tiles"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 141 - 180 (Masonry, Plaster, Ceilings, Floors)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    for num, query in ITEMS_141_180:
        t0 = time.perf_counter()
        res = engine.recommend(query)
        dt = (time.perf_counter() - t0) * 1000
        latencies.append(dt)

        primary = res.get("primary_recommendation")
        cert = res.get("certification", {})
        is_qco = cert.get("is_mandatory", False)
        status_label = cert.get("status", "VOLUNTARY")
        
        std_id = primary.get("family_id", "NOT_FOUND") if primary else "NOT_FOUND"
        raw_id = primary.get("raw_id", std_id) if primary else "NOT_FOUND"
        title = primary.get("title_en", "") if primary else ""
        confidence = primary.get("confidence", {}).get("overall_label", "UNKNOWN") if primary else "UNKNOWN"
        gap_advisory = res.get("procurement_gap_advisory")

        results.append({
            "num": num,
            "query": query,
            "std_id": std_id,
            "raw_id": raw_id,
            "title": title,
            "confidence": confidence,
            "qco_mandatory": is_qco,
            "cert_status": status_label,
            "gap_advisory": gap_advisory,
            "latency_ms": round(dt, 1)
        })

        print(f"[{num}] {query[:42]:<42} -> {raw_id:<14} ({confidence:<6}) [QCO: {str(is_qco):<5}] [{dt:>5.1f}ms]", flush=True)

    avg_latency = sum(latencies) / len(latencies)
    print("=" * 80)
    print(f"Evaluation Complete! Average Latency: {avg_latency:.1f} ms")
    print("=" * 80)

    # Save JSON results
    out_json = os.path.join(BACKEND_DIR, "eval", "batch_141_180_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "total_items": len(results),
            "average_latency_ms": round(avg_latency, 1),
            "results": results
        }, f, indent=2)

    return results, avg_latency

if __name__ == "__main__":
    run_evaluation()
