import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_101_140 = [
    (101, "Site clearance including removal of bushes, debris and unwanted vegetation"),
    (102, "Topsoil stripping and disposal"),
    (103, "Earth filling with approved soil in layers"),
    (104, "Earth filling with selected excavated soil"),
    (105, "Compacted earth filling below floor"),
    (106, "Sand filling below flooring"),
    (107, "Granular sub-base for road construction"),
    (108, "Wet mix macadam road base"),
    (109, "Water bound macadam road construction"),
    (110, "Bituminous macadam pavement"),
    (111, "Dense bituminous macadam"),
    (112, "Bituminous concrete wearing course"),
    (113, "Prime coat for bituminous pavement"),
    (114, "Tack coat for bituminous pavement"),
    (115, "Cement concrete pavement"),
    (116, "Plain cement concrete bedding"),
    (117, "Lean concrete for foundation bed"),
    (118, "PCC 1:4:8 for foundation"),
    (119, "PCC 1:3:6 for flooring base"),
    (120, "Reinforced concrete column"),
    (121, "Reinforced concrete beam"),
    (122, "Reinforced concrete slab"),
    (123, "Reinforced concrete staircase"),
    (124, "Reinforced concrete retaining wall"),
    (125, "Reinforced concrete footing"),
    (126, "Raft foundation concrete"),
    (127, "Pile foundation concrete"),
    (128, "Reinforced concrete pile cap"),
    (129, "Prestressed concrete beams"),
    (130, "Prestressed concrete railway sleepers"),
    (131, "Ready-mixed self-compacting concrete"),
    (132, "High-strength concrete"),
    (133, "Lightweight concrete"),
    (134, "Fibre-reinforced concrete"),
    (135, "Shotcrete for structural repair"),
    (136, "Grouting of foundation pockets"),
    (137, "Non-shrink cementitious grout"),
    (138, "Epoxy grout for structural applications"),
    (139, "Concrete curing compound"),
    (140, "Concrete surface hardener"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 101 - 140 (Civil & Infrastructure)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    for num, query in ITEMS_101_140:
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
    out_json = os.path.join(BACKEND_DIR, "eval", "batch_101_140_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "total_items": len(results),
            "average_latency_ms": round(avg_latency, 1),
            "results": results
        }, f, indent=2)

    return results, avg_latency

if __name__ == "__main__":
    run_evaluation()
