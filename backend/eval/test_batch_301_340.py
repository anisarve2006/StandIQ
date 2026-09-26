import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_301_340 = [
    (301, "PVC insulated copper wires"),
    (302, "PVC insulated aluminium wires"),
    (303, "XLPE insulated power cables"),
    (304, "XLPE armoured power cables"),
    (305, "PVC armoured power cables"),
    (306, "Flexible electrical cables"),
    (307, "Fire-resistant electrical cables"),
    (308, "Low-smoke zero-halogen cables"),
    (309, "Underground power cables"),
    (310, "Control cables"),
    (311, "Instrumentation cables"),
    (312, "Telephone cables"),
    (313, "Coaxial cables"),
    (314, "Optical fibre cables"),
    (315, "Cable trays"),
    (316, "Perforated cable trays"),
    (317, "Ladder-type cable trays"),
    (318, "GI cable conduits"),
    (319, "PVC electrical conduits"),
    (320, "Flexible electrical conduits"),
    (321, "Modular switches"),
    (322, "Modular electrical sockets"),
    (323, "Industrial plug and socket outlets"),
    (324, "MCB distribution board"),
    (325, "MCCB"),
    (326, "RCCB"),
    (327, "RCBO"),
    (328, "HRC fuse"),
    (329, "Switch disconnector"),
    (330, "Automatic transfer switch"),
    (331, "Main distribution board"),
    (332, "Motor control centre"),
    (333, "Capacitor bank"),
    (334, "Power factor correction panel"),
    (335, "Busbar trunking system"),
    (336, "Electrical isolator"),
    (337, "Lightning protection system"),
    (338, "Copper earthing electrode"),
    (339, "GI earthing strip"),
    (340, "Chemical earthing electrode"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 301 - 340 (Electrical & Power Distribution)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    for num, query in ITEMS_301_340:
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

        print(f"[{num}] {query[:38]:<38} -> {raw_id:<16} ({confidence:<6}) [QCO: {str(is_qco):<5}] [{dt:>5.1f}ms]", flush=True)

    avg_latency = sum(latencies) / len(latencies)
    print("=" * 80)
    print(f"Evaluation Complete! Average Latency: {avg_latency:.1f} ms")
    print("=" * 80)

    # Save JSON results
    out_json = os.path.join(BACKEND_DIR, "eval", "batch_301_340_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "total_items": len(results),
            "average_latency_ms": round(avg_latency, 1),
            "results": results
        }, f, indent=2)

    return results, avg_latency

if __name__ == "__main__":
    run_evaluation()
