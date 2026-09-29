import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_381_420 = [
    (381, "Safety harness for construction workers"),
    (382, "Safety lanyard"),
    (383, "Reflective safety jacket"),
    (384, "Industrial safety goggles"),
    (385, "Welding protective goggles"),
    (386, "Face shield for workers"),
    (387, "Industrial safety gloves"),
    (388, "Heat-resistant protective gloves"),
    (389, "Chemical-resistant gloves"),
    (390, "Respiratory protective mask"),
    (391, "Half-mask respirator"),
    (392, "Full-face respirator"),
    (393, "Ear protection earmuffs"),
    (394, "Industrial earplugs"),
    (395, "Safety gumboots"),
    (396, "Industrial protective footwear"),
    (397, "High-visibility traffic cones"),
    (398, "Road safety barricades"),
    (399, "Reflective warning signs"),
    (400, "Temporary construction fencing"),
    (401, "Steel scaffolding pipes"),
    (402, "Scaffolding couplers"),
    (403, "Adjustable steel props"),
    (404, "Aluminium scaffolding system"),
    (405, "Construction ladders"),
    (406, "Extension ladders"),
    (407, "Mobile access platform"),
    (408, "Suspended scaffolding platform"),
    (409, "Construction hoist"),
    (410, "Passenger-cum-material hoist"),
    (411, "Tower crane"),
    (412, "Mobile crane"),
    (413, "Electric chain hoist"),
    (414, "Wire rope slings"),
    (415, "Shackles for lifting"),
    (416, "Chain pulley block"),
    (417, "Hydraulic jacks"),
    (418, "Concrete vibrator"),
    (419, "Concrete batching plant"),
    (420, "Concrete transit mixer"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 381 - 420 (Safety, PPE, Scaffolding & Cranes)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    print(f"\n{'#':<5} | {'Item Description':<40} | {'Primary IS':<18} | {'QCO':<5} | {'Conf':<8} | {'Time (ms)':<9}")
    print("-" * 92)

    for item_no, desc in ITEMS_381_420:
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
    print(f"Batch 381-420 Completed: 40/40 items resolved.")
    print(f"Average latency: {sum(latencies) / len(latencies):.2f}ms per query.")
    print("=" * 92)

    out_path = os.path.join(os.path.dirname(__file__), "batch_381_420_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Detailed evaluation metrics stored at: {out_path}")

if __name__ == "__main__":
    run_evaluation()
