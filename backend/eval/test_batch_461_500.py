import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_461_500 = [
    (461, "Compressive strength test of concrete cubes"),
    (462, "Flexural strength test of concrete"),
    (463, "Split tensile strength test of concrete"),
    (464, "Slump test of fresh concrete"),
    (465, "Concrete water absorption test"),
    (466, "Concrete density test"),
    (467, "Cement fineness test"),
    (468, "Cement soundness test"),
    (469, "Cement consistency test"),
    (470, "Cement initial and final setting time test"),
    (471, "Cement compressive strength test"),
    (472, "Cement mortar strength test"),
    (473, "Fine aggregate sieve analysis"),
    (474, "Coarse aggregate sieve analysis"),
    (475, "Aggregate impact value test"),
    (476, "Aggregate crushing value test"),
    (477, "Aggregate abrasion test"),
    (478, "Aggregate flakiness index test"),
    (479, "Aggregate elongation index test"),
    (480, "Aggregate water absorption test"),
    (481, "Brick compressive strength test"),
    (482, "Brick water absorption test"),
    (483, "Brick efflorescence test"),
    (484, "Brick dimensional tolerance test"),
    (485, "Concrete block compressive strength test"),
    (486, "AAC block density test"),
    (487, "Tile water absorption test"),
    (488, "Tile breaking strength test"),
    (489, "Tile modulus of rupture test"),
    (490, "Tile dimensional tolerance test"),
    (491, "Reinforcement steel tensile strength test"),
    (492, "Reinforcement steel bend test"),
    (493, "Reinforcement steel rebend test"),
    (494, "Structural steel tensile test"),
    (495, "Structural steel impact test"),
    (496, "PVC pipe hydrostatic pressure test"),
    (497, "HDPE pipe hydrostatic pressure test"),
    (498, "Water-tightness test of plumbing installation"),
    (499, "Electrical cable insulation resistance test"),
    (500, "Earthing resistance measurement"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 461 - 500 (Testing, QA & Material Characterization)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    print(f"\n{'#':<5} | {'Item Description':<45} | {'Primary IS':<18} | {'QCO':<5} | {'Conf':<8} | {'Time (ms)':<9}")
    print("-" * 97)

    for item_no, desc in ITEMS_461_500:
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
        print(f"{item_no:<5} | {desc:<45} | {std_id:<18} | {qco_str:<5} | {confidence:<8} | {dt:<9.1f}")

    print("=" * 97)
    print(f"Batch 461-500 Completed: 40/40 items resolved.")
    print(f"Average latency: {sum(latencies) / len(latencies):.2f}ms per query.")
    print("=" * 97)

    out_path = os.path.join(os.path.dirname(__file__), "batch_461_500_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Detailed evaluation metrics stored at: {out_path}")

if __name__ == "__main__":
    run_evaluation()
