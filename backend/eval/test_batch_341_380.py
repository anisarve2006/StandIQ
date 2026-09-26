import os
import sys
import time
import json

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

ITEMS_341_380 = [
    (341, "LED panel light"),
    (342, "LED downlight"),
    (343, "LED tube light"),
    (344, "LED floodlight"),
    (345, "LED high-bay luminaire"),
    (346, "LED emergency light"),
    (347, "Exit sign luminaire"),
    (348, "Explosion-proof LED luminaire"),
    (349, "Solar street light"),
    (350, "Solar LED garden light"),
    (351, "High mast lighting system"),
    (352, "Street lighting pole"),
    (353, "Decorative indoor lighting fixture"),
    (354, "Outdoor lighting fixture"),
    (355, "Emergency lighting battery system"),
    (356, "Lead-acid battery bank"),
    (357, "Lithium-ion battery energy storage system"),
    (358, "Standby diesel generator"),
    (359, "Automatic mains failure panel"),
    (360, "Generator control panel"),
    (361, "Electrical distribution transformer"),
    (362, "Dry-type transformer"),
    (363, "Oil-immersed transformer"),
    (364, "Voltage stabilizer"),
    (365, "Servo voltage stabilizer"),
    (366, "Static UPS"),
    (367, "Online double-conversion UPS"),
    (368, "Inverter system"),
    (369, "Solar photovoltaic inverter"),
    (370, "Solar photovoltaic module"),
    (371, "Solar charge controller"),
    (372, "Building energy meter"),
    (373, "Smart electricity meter"),
    (374, "CCTV camera system"),
    (375, "Network video recorder"),
    (376, "Public address system"),
    (377, "Access control system"),
    (378, "Biometric attendance system"),
    (379, "Video intercom system"),
    (380, "Intrusion alarm system"),
]

def run_evaluation():
    print("=" * 80)
    print("Starting StandIQ Evaluation on Items 341 - 380 (Lighting, Power Systems & Security)")
    print("=" * 80)

    engine = StandardsRecommenderEngine()
    results = []
    latencies = []

    for num, query in ITEMS_341_380:
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

        print(f"[{num}] {query[:40]:<40} -> {raw_id:<16} ({confidence:<6}) [QCO: {str(is_qco):<5}] [{dt:>5.1f}ms]", flush=True)

    avg_latency = sum(latencies) / len(latencies)
    print("=" * 80)
    print(f"Evaluation Complete! Average Latency: {avg_latency:.1f} ms")
    print("=" * 80)

    # Save JSON results
    out_json = os.path.join(BACKEND_DIR, "eval", "batch_341_380_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "total_items": len(results),
            "average_latency_ms": round(avg_latency, 1),
            "results": results
        }, f, indent=2)

    return results, avg_latency

if __name__ == "__main__":
    run_evaluation()
