import os
import sys
import time
import json

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine

STANDARDS_100 = [
    "Supply and laying of TMT Fe-500D steel reinforcement bars of various diameters for RCC beams, columns, slabs and foundations, including cutting, bending, binding and placing.",
    "Providing and laying ordinary Portland cement 53 grade for structural concrete works, including transportation, stacking and storage at site.",
    "Providing and laying OPC 43 grade cement for masonry and plastering works.",
    "Providing and laying Portland Pozzolana Cement for general civil construction and concrete works.",
    "Excavation in foundation trenches in ordinary soil, murum, gravel and sand, including dressing of sides, disposal of excavated material and backfilling.",
    "Mechanical excavation for building foundations up to 1.5 m depth including removal of excavated earth within 50 m lead.",
    "Filling in plinth with approved earth in layers of 150 mm to 200 mm, including watering, levelling and mechanical compaction.",
    "Providing and laying dry rubble stone soling using hard trap stone, 150 mm thick, including hand packing and compaction.",
    "Providing and laying rubble stone soling using granite and quartzite stones for foundation bed preparation.",
    "Providing and laying M-10 grade cement concrete using coarse aggregate and crushed sand for foundation bedding.",
    "Providing and laying M-15 grade plain cement concrete for plinth coping and flooring base.",
    "Providing and laying M-20 grade RCC concrete using crushed sand and graded coarse aggregate for beams and lintels.",
    "Providing and laying ready-mixed concrete for structural RCC work, including pumping, placing, vibration and curing.",
    "Providing ready mix concrete for foundations, columns, beams and slabs using approved aggregates.",
    "Providing and laying coarse aggregate of approved quality for concrete production.",
    "Providing and laying crushed sand manufactured using VSI technology as fine aggregate for concrete work.",
    "Supply of natural fine aggregate for use in cement concrete and mortar.",
    "Supply and laying cement mortar 1:6 for brick masonry in foundation and plinth.",
    "Providing cement mortar 1:4 for external plastering over masonry surfaces.",
    "Providing cement mortar 1:3 for rendering uneven concrete and honeycombed surfaces.",
    "Construction of masonry walls using common burnt clay building bricks in cement mortar.",
    "Construction of foundation and plinth masonry using fly ash bricks in cement mortar 1:6.",
    "Providing and laying fly ash bricks for load-bearing masonry work.",
    "Providing and laying conventional clay bricks of uniform size and approved compressive strength for building construction.",
    "Providing and laying vitrified floor tiles of size 600 mm × 600 mm, including cement mortar bedding, joint filling, curing and cleaning.",
    "Providing and laying glossy finish ceramic tiles on floors using cement mortar bed.",
    "Providing and fixing ceramic glazed wall tiles of approved size and colour over cement mortar backing.",
    "Providing and laying pressed ceramic tiles for flooring including cutting, jointing and cleaning.",
    "Providing and fixing stainless steel kitchen sink of approved size for domestic use.",
    "Providing and fixing vitreous china wash basin including brackets, supports and necessary fittings.",
    "Providing and fixing vitreous sanitary ware squatting pans for toilet construction.",
    "Providing and fixing plastic flushing cistern for water closet including necessary connections.",
    "Providing and laying UPVC pipes for soil and waste discharge systems in buildings.",
    "Providing and laying PVC pipes for potable water supply including joints and fittings.",
    "Providing and laying CPVC pipes for hot and cold potable water supply systems.",
    "Providing and fixing GI steel pipes for water supply and plumbing applications.",
    "Providing and fixing sluice/gate valves for water supply pipeline installations.",
    "Providing and fixing submersible pump set for pumping clear cold water from borewell.",
    "Supply and installation of submersible motor pump of suitable capacity for domestic water supply.",
    "Supply and installation of monobloc pump set for pumping clear fresh water.",
    "Providing and fixing electric ceiling fans with regulators in residential and institutional buildings.",
    "Providing and fixing LED lamps for general indoor lighting applications.",
    "Providing and fixing LED luminaires for road and street lighting applications.",
    "Providing and installing outdoor distribution transformers for electrical power distribution.",
    "Supply and installation of static watt-hour energy meters for AC electrical installations.",
    "Supply and installation of energy-efficient three-phase induction motors for industrial applications.",
    "Providing and installing an uninterruptible power supply system for computer and electronic equipment.",
    "Providing and fixing PVC insulated electrical cables for internal wiring and power distribution.",
    "Providing and fixing PVC insulated and sheathed cables for electrical installations.",
    "Supply and installation of laptops/notebook computers for office use.",
    "Supply and installation of CCTV cameras and associated information technology equipment.",
    "Providing and fixing industrial safety helmets for construction workers.",
    "Supply of industrial safety footwear for workers at construction sites.",
    "Supply of disposable sterile surgical rubber gloves for hospital use.",
    "Supply of disposable surgical face masks for medical applications.",
    "Supply of sterile hypodermic syringes for single-use medical applications.",
    "Supply of digital clinical thermometers for medical facilities.",
    "Supply of packaged drinking water for institutional consumption.",
    "Supply of packaged natural mineral water for public events.",
    "Supply of fertilizer-grade urea for agricultural applications.",
    "Supply of stable bleaching powder for water disinfection purposes.",
    "Providing and applying synthetic enamel paint to prepared metal and wooden surfaces in two coats.",
    "Providing and applying ready-mixed red oxide primer to steel surfaces before painting.",
    "Providing and applying aluminium primer to resinous wooden surfaces.",
    "Providing and applying dry colour distemper to internal plastered surfaces.",
    "Providing and applying cement paint to external plastered building surfaces.",
    "Providing and applying waterproof cement paint to exterior masonry and plaster surfaces.",
    "Providing integral waterproofing compound in cement mortar and concrete works.",
    "Providing waterproofing treatment using approved waterproofing compounds mixed with cement mortar.",
    "Providing external sand-faced plaster in two coats using cement mortar and screened sand.",
    "Providing 15 mm thick cement plaster in mortar 1:4 with waterproofing compound for external walls.",
    "Providing approximately 6 mm thick finishing coat over external cement plaster using screened sand.",
    "Providing external rendered finish to masonry and concrete surfaces including surface preparation.",
    "Providing and fixing wooden solid-core flush door shutters of approved thickness and finish.",
    "Providing and fixing vertical type door handles suitable for mortice locks.",
    "Providing and fixing mild steel casement stays and fasteners for window shutters.",
    "Providing and fixing non-ferrous metal sliding door bolts and aldrops for padlocks.",
    "Providing and fixing non-ferrous metal tower bolts for doors and windows.",
    "Providing and fixing floor-mounted door stoppers for building doors.",
    "Providing and fixing pressed steel door frames including anchoring and grouting.",
    "Providing galvanized steel plain sheets for roofing and cladding applications.",
    "Providing galvanized steel corrugated/profile sheets for roofing work including ridges and hips.",
    "Providing acrylic sheets of approved thickness for building partitions and protective covers.",
    "Providing and fixing granite stone slabs for flooring, wall cladding and architectural applications.",
    "Providing and fixing polished marble slabs for flooring and wall finishing.",
    "Providing and fixing Kota stone slabs and tiles for flooring and stair applications.",
    "Providing gypsum plaster/Plaster of Paris for internal wall and ceiling finishing.",
    "Providing common burnt clay bricks for building masonry work including transportation and stacking.",
    "Providing fly ash-lime bricks for building construction and masonry work.",
    "Providing and laying ready-mixed concrete for reinforced concrete structural members including batching, transportation, pumping and curing.",
    "Testing of hardened M-20 concrete specimens to determine compressive strength at specified ages.",
    "Testing of fine aggregate/sand for suitability for use in cement concrete and mortar.",
    "Testing of coarse aggregate for physical and mechanical properties before use in concrete.",
    "Testing reinforcement steel bars for mechanical and chemical properties before use in RCC work.",
    "Testing cement samples for conformity with specified physical and chemical requirements.",
    "Testing bricks supplied to the construction site for compressive strength and water absorption.",
    "Testing vitrified ceramic tiles for relevant dimensional, physical and surface characteristics.",
    "Testing potable water supply pipes for pressure, dimensions and other specified properties.",
    "Supply and installation of carbon steel tubes for mechanical and general engineering applications.",
    "Supply and installation of cryogenic vessels/tanks for storage of liquid nitrogen in an industrial facility."
]


def run_100_standards_test():
    print(f"Initializing StandardsRecommenderEngine...")
    engine = StandardsRecommenderEngine()
    
    results = []
    total_time = 0
    qco_count = 0
    matched_count = 0

    print(f"\nEvaluating 100 Indian Procurement Specifications...")
    print("=" * 80)

    for i, spec in enumerate(STANDARDS_100, 1):
        t0 = time.time()
        res = engine.recommend(spec)
        elapsed_ms = round((time.time() - t0) * 1000, 1)
        total_time += elapsed_ms

        primary = res.get("primary_recommendation")
        cert = res.get("certification", {})
        is_qco = cert.get("is_mandatory", False)
        status_label = cert.get("status", "VOLUNTARY")
        
        if is_qco:
            qco_count += 1

        if primary:
            matched_count += 1
            fid = primary.get("family_id", "UNKNOWN")
            raw_id = primary.get("raw_id", fid)
            title = primary.get("title_en", "")[:60]
            conf = primary.get("confidence", {}).get("overall_label", "MEDIUM")
            results.append({
                "index": i,
                "query": spec,
                "family_id": fid,
                "raw_id": raw_id,
                "title": title,
                "qco_mandatory": is_qco,
                "cert_status": status_label,
                "confidence": conf,
                "latency_ms": elapsed_ms
            })
            print(f"[{i:03d}/100] {fid:<14} | {conf:<6} | QCO: {str(is_qco):<5} | {elapsed_ms:>5.1f}ms | {spec[:45]}...")
        else:
            results.append({
                "index": i,
                "query": spec,
                "family_id": "NONE",
                "raw_id": "NONE",
                "title": "No standard matched",
                "qco_mandatory": False,
                "cert_status": "NONE",
                "confidence": "NONE",
                "latency_ms": elapsed_ms
            })
            print(f"[{i:03d}/100] NONE           | NONE   | QCO: False | {elapsed_ms:>5.1f}ms | {spec[:45]}...")

    avg_latency = round(total_time / len(STANDARDS_100), 1)
    coverage = round((matched_count / len(STANDARDS_100)) * 100, 1)

    print("=" * 80)
    print(f"100 STANDARDS BENCHMARK RESULTS:")
    print(f"Total Evaluated:       {len(STANDARDS_100)}")
    print(f"Standards Matched:     {matched_count} ({coverage}%)")
    print(f"Mandatory QCO Items:   {qco_count}")
    print(f"Average Pipeline Time: {avg_latency} ms / query")
    print("=" * 80)

    # Save results to JSON
    report_json_path = os.path.join(BACKEND_DIR, "eval", "100_standards_test_results.json")
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "metrics": {
                "total_items": len(STANDARDS_100),
                "matched_count": matched_count,
                "coverage_pct": coverage,
                "mandatory_qco_count": qco_count,
                "avg_latency_ms": avg_latency
            },
            "results": results
        }, f, indent=2, ensure_ascii=False)
    print(f"JSON saved to {report_json_path}")

    # Generate Markdown Report
    report_md_path = os.path.join(BACKEND_DIR, "eval", "100_standards_test_report.md")
    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write("# StandIQ: 100 Procurement Standards Retrieval Benchmark\n\n")
        f.write(f"- **Total Specifications Tested**: {len(STANDARDS_100)}\n")
        f.write(f"- **Standards Identification Rate**: {matched_count}/{len(STANDARDS_100)} ({coverage}%)\n")
        f.write(f"- **Mandatory QCO Detected**: {qco_count}\n")
        f.write(f"- **Average Query Latency**: {avg_latency} ms\n\n")
        f.write("## Detailed Test Results\n\n")
        f.write("| # | Procurement Specification | IS Standard | Confidence | Mandatory QCO | Latency |\n")
        f.write("|---|---|---|---|---|---|\n")
        for r in results:
            clean_q = r["query"].replace("|", "\\|")
            f.write(f"| {r['index']} | {clean_q[:65]}... | **{r['family_id']}** - {r['title'][:40]} | {r['confidence']} | {r['cert_status']} | {r['latency_ms']}ms |\n")
    print(f"Markdown report saved to {report_md_path}")

    return results


if __name__ == "__main__":
    run_100_standards_test()
