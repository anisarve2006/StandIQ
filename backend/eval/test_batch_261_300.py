import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_261_300 = [
    (261, "Horizontal centrifugal water pump"),
    (262, "Vertical centrifugal pump"),
    (263, "End-suction centrifugal pump"),
    (264, "Booster pump set"),
    (265, "Pressure booster system"),
    (266, "Sewage submersible pump"),
    (267, "Drainage sump pump"),
    (268, "Fire fighting pump"),
    (269, "Diesel engine driven fire pump"),
    (270, "Jockey pump"),
    (271, "Fire hydrant landing valve"),
    (272, "Fire hose reel"),
    (273, "Fire hose"),
    (274, "Fire hydrant box"),
    (275, "Fire sprinkler heads"),
    (276, "Wet riser system"),
    (277, "Dry riser system"),
    (278, "Fire extinguishing piping"),
    (279, "Fire water storage tank"),
    (280, "Portable water fire extinguisher"),
    (281, "Carbon dioxide fire extinguisher"),
    (282, "Dry chemical powder fire extinguisher"),
    (283, "Air handling unit"),
    (284, "Packaged air conditioning unit"),
    (285, "Split air conditioner"),
    (286, "Ductable split air conditioner"),
    (287, "VRF air conditioning system"),
    (288, "Chilled water air conditioning system"),
    (289, "Air-cooled chiller"),
    (290, "Water-cooled chiller"),
    (291, "Cooling tower"),
    (292, "Centrifugal ventilation fan"),
    (293, "Axial flow ventilation fan"),
    (294, "Smoke extraction fan"),
    (295, "Kitchen exhaust hood"),
    (296, "GI sheet air-conditioning ducts"),
    (297, "Flexible air ducts"),
    (298, "Thermal insulation for HVAC ducts"),
    (299, "Acoustic duct insulation"),
    (300, "Air filters for HVAC systems"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 261 - 300 (Pumps, Fire Protection, HVAC)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    for num, query in ITEMS_261_300:
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
    out_json = os.path.join(BACKEND_DIR, "eval", "batch_261_300_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "total_items": len(results),
            "average_latency_ms": round(avg_latency, 1),
            "results": results
        }, f, indent=2)

    return results, avg_latency

if __name__ == "__main__":
    run_evaluation()
