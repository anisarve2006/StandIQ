import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_181_220 = [
    (181, "Aluminium glazed windows"),
    (182, "Aluminium sliding windows"),
    (183, "UPVC sliding windows"),
    (184, "UPVC casement windows"),
    (185, "Steel windows"),
    (186, "Wooden panel doors"),
    (187, "Wooden glazed doors"),
    (188, "Fire-rated steel doors"),
    (189, "Fire-rated wooden doors"),
    (190, "PVC doors"),
    (191, "Aluminium doors"),
    (192, "Glass doors"),
    (193, "Toughened glass for doors"),
    (194, "Laminated safety glass"),
    (195, "Wired glass panels"),
    (196, "Double-glazed window units"),
    (197, "Door closers"),
    (198, "Mortice locks"),
    (199, "Cylindrical locks"),
    (200, "Padlocks for building applications"),
    (201, "Stainless steel door hinges"),
    (202, "Aluminium door handles"),
    (203, "Door floor springs"),
    (204, "Panic exit devices"),
    (205, "Roof waterproofing membrane"),
    (206, "Bituminous waterproofing membrane"),
    (207, "APP modified bitumen membrane"),
    (208, "PVC waterproofing membrane"),
    (209, "Cementitious waterproofing coating"),
    (210, "Liquid-applied waterproofing coating"),
    (211, "Roof insulation boards"),
    (212, "Expanded polystyrene insulation"),
    (213, "Extruded polystyrene insulation"),
    (214, "Rock wool insulation"),
    (215, "Glass wool insulation"),
    (216, "Aluminium roofing sheets"),
    (217, "Fibre cement roofing sheets"),
    (218, "Polycarbonate roofing sheets"),
    (219, "Roof ridge caps"),
    (220, "Roof gutters and downpipes"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 181 - 220 (Doors, Windows, Hardware, Waterproofing, Roofing)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    for num, query in ITEMS_181_220:
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
    out_json = os.path.join(BACKEND_DIR, "eval", "batch_181_220_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "total_items": len(results),
            "average_latency_ms": round(avg_latency, 1),
            "results": results
        }, f, indent=2)

    return results, avg_latency

if __name__ == "__main__":
    run_evaluation()
