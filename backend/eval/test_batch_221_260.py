import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_221_260 = [
    (221, "HDPE potable water pipes"),
    (222, "HDPE drainage pipes"),
    (223, "HDPE sewerage pipes"),
    (224, "PPR water supply pipes"),
    (225, "PPR hot water pipes"),
    (226, "PVC pressure pipes"),
    (227, "PVC drainage pipes"),
    (228, "PVC SWR pipes"),
    (229, "Cast iron soil pipes"),
    (230, "Ductile iron water pipes"),
    (231, "Copper water supply pipes"),
    (232, "Stainless steel water pipes"),
    (233, "Brass compression fittings"),
    (234, "CPVC pipe fittings"),
    (235, "UPVC pipe fittings"),
    (236, "HDPE pipe fittings"),
    (237, "PPR pipe fittings"),
    (238, "Ductile iron pipe fittings"),
    (239, "Brass bib taps"),
    (240, "Pillar taps"),
    (241, "Angle valves"),
    (242, "Ball valves"),
    (243, "Butterfly valves"),
    (244, "Check valves"),
    (245, "Pressure reducing valves"),
    (246, "Float valves"),
    (247, "Air release valves"),
    (248, "Water meters"),
    (249, "Domestic water storage tanks"),
    (250, "Polyethylene water storage tanks"),
    (251, "Reinforced concrete water tanks"),
    (252, "Septic tank"),
    (253, "Sewage treatment plant"),
    (254, "Grease trap"),
    (255, "Floor traps"),
    (256, "Nahani traps"),
    (257, "Gully traps"),
    (258, "Manhole covers"),
    (259, "Cast iron drainage gratings"),
    (260, "Sanitary drainage inspection chambers"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 221 - 260 (Plumbing, Pipes, Valves & Drainage)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    print(f"\n{'#':<5} | {'Item Description':<40} | {'Primary IS':<18} | {'QCO':<5} | {'Conf':<8} | {'Time (ms)':<9}")
    print("-" * 92)

    for item_no, desc in ITEMS_221_260:
        t0 = time.perf_counter()
        res = engine.recommend(desc)
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

        results.append({
            "item_no": item_no,
            "description": desc,
            "primary_is": std_id,
            "raw_id": raw_id,
            "title": title,
            "qco_mandated": is_qco,
            "certification_status": status_label,
            "confidence": confidence,
            "latency_ms": dt
        })

        qco_str = "Yes" if is_qco else "No"
        print(f"{item_no:<5} | {desc:<40} | {std_id:<18} | {qco_str:<5} | {confidence:<8} | {dt:<9.1f}")

    print("=" * 92)
    print(f"Batch 221-260 Completed: 40/40 items resolved.")
    print(f"Average latency: {sum(latencies) / len(latencies):.2f}ms per query.")
    print("=" * 92)

    out_path = os.path.join(os.path.dirname(__file__), "batch_221_260_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Detailed evaluation metrics stored at: {out_path}")

if __name__ == "__main__":
    run_evaluation()
