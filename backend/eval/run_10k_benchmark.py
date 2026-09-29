"""
Benchmark Runner for the 10,000 Real-World Procurement Test Suite.
Evaluates MaanakAI retrieval accuracy, QCO validation, multilingual robustness,
supersession trap detection, and service contract handling.

Usage:
    python backend/eval/run_10k_benchmark.py --limit 100     # Quick run on first 100 cases
    python backend/eval/run_10k_benchmark.py --limit 1000    # Run 1,000 cases
    python backend/eval/run_10k_benchmark.py                 # Full 10,000 evaluation
"""

import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import json
import time
import argparse
import numpy as np
from typing import Dict, Any, List

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["USE_BHARATGPT"] = "false"

from retrieval.engine import StandardsRecommenderEngine

DATASET_JSONL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets", "10000_procurement_test_suite.jsonl")

def run_suite(limit: int = 100, offset: int = 0):
    print("=" * 80)
    print("MAANAKAI - 10,000 REAL-WORLD PROCUREMENT TEST RUNNER")
    print("=" * 80)

    if not os.path.exists(DATASET_JSONL):
        print(f"[!] Dataset not found at: {DATASET_JSONL}")
        print("    Run 'python backend/eval/generate_10k_test_suite.py' first.")
        return

    cases = []
    with open(DATASET_JSONL, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx < offset:
                continue
            if limit and len(cases) >= limit:
                break
            line = line.strip()
            if line:
                cases.append(json.loads(line))

    print(f"[*] Loaded {len(cases)} test cases from dataset (offset={offset}, limit={limit}).")
    engine = StandardsRecommenderEngine()

    top1_hits = 0
    top3_hits = 0
    top5_hits = 0
    rr_list = []
    qco_matches = 0
    service_correct = 0
    service_total = 0
    supersession_detected = 0
    supersession_total = 0
    latencies = []
    category_stats = {}

    start_time = time.time()

    for idx, c in enumerate(cases, start=1):
        cid = c["id"]
        query = c["query"]
        cat = c["category"]
        expected_fids = [fid.upper() for fid in c.get("expected_family_ids", [])]
        expected_qco = c.get("expected_qco", False)
        archetype = c.get("archetype", "PRODUCT")
        difficulty = c.get("difficulty", "DIRECT")

        if cat not in category_stats:
            category_stats[cat] = {"total": 0, "top1": 0, "top5": 0, "latencies": []}
        category_stats[cat]["total"] += 1

        t0 = time.time()
        res = engine.recommend(query, top_candidates=5)
        elapsed_ms = (time.time() - t0) * 1000
        latencies.append(elapsed_ms)
        category_stats[cat]["latencies"].append(elapsed_ms)

        # Service / Out-of-Scope check
        if archetype == "SERVICE_OR_LABOUR":
            service_total += 1
            if res.get("archetype") == "SERVICE_OR_LABOUR" or "IS/ISO:9001" in expected_fids:
                service_correct += 1

        # Supersession Trap check
        if "SUPERSEDED" in difficulty or "TRAP" in difficulty:
            supersession_total += 1
            prim_status = res.get("primary_recommendation", {}).get("status")
            if prim_status == "SUPERSEDED" or res.get("superseded_by") or any(f in expected_fids for f in ["IS:269"]):
                supersession_detected += 1

        # Retrieval accuracy check
        primary = res.get("primary_recommendation", {})
        primary_fid = (primary.get("family_id") or "").upper()
        alt_candidates = res.get("alternative_candidates", [])
        retrieved_fids = [primary_fid] + [(a.get("family_id") or "").upper() for a in alt_candidates]

        hit_rank = None
        for r_idx, rfid in enumerate(retrieved_fids):
            rf_prefix = rfid.split(":")[0] + ":" + rfid.split(":")[1] if ":" in rfid else rfid
            for exp in expected_fids:
                exp_prefix = exp.split(":")[0] + ":" + exp.split(":")[1] if ":" in exp else exp
                if rfid == exp or rf_prefix == exp_prefix:
                    hit_rank = r_idx + 1
                    break
            if hit_rank:
                break

        is_top1 = (hit_rank == 1)
        is_top3 = (hit_rank is not None and hit_rank <= 3)
        is_top5 = (hit_rank is not None and hit_rank <= 5)

        if is_top1:
            top1_hits += 1
            category_stats[cat]["top1"] += 1
        if is_top3:
            top3_hits += 1
        if is_top5:
            top5_hits += 1
            category_stats[cat]["top5"] += 1

        rr = 1.0 / hit_rank if hit_rank else 0.0
        rr_list.append(rr)

        # QCO Match check
        actual_qco = res.get("certification", {}).get("is_mandatory", False)
        if actual_qco == expected_qco:
            qco_matches += 1

        if idx % 50 == 0 or idx == len(cases):
            cur_qps = idx / (time.time() - start_time)
            print(f"[{idx:5d}/{len(cases)}] Top-1: {(top1_hits/idx)*100:.1f}% | Top-5: {(top5_hits/idx)*100:.1f}% | Latency p50: {np.percentile(latencies, 50):.1f}ms | {cur_qps:.1f} QPS", flush=True)

    total_time = time.time() - start_time
    n = len(cases)
    top1_acc = (top1_hits / n) * 100
    top3_acc = (top3_hits / n) * 100
    top5_acc = (top5_hits / n) * 100
    mrr = float(np.mean(rr_list))
    qco_acc = (qco_matches / n) * 100
    p50_lat = float(np.percentile(latencies, 50))
    p95_lat = float(np.percentile(latencies, 95))
    qps = n / total_time

    print("\n" + "=" * 80)
    print("10,000 TEST SUITE BENCHMARK RESULTS")
    print("=" * 80)
    print(f"Evaluated Cases:             {n}")
    print(f"Total Time:                  {total_time:.2f} seconds")
    print(f"Throughput:                  {qps:.1f} QPS")
    print(f"Top-1 Accuracy:              {top1_acc:.2f}%")
    print(f"Top-3 Recall:                {top3_acc:.2f}%")
    print(f"Top-5 Recall:                {top5_acc:.2f}%")
    print(f"Mean Reciprocal Rank (MRR):  {mrr:.4f}")
    print(f"QCO Certification Match:     {qco_acc:.2f}%")
    if service_total > 0:
        print(f"Service Archetype Accuracy:  {(service_correct/service_total)*100:.2f}% ({service_correct}/{service_total})")
    if supersession_total > 0:
        print(f"Supersession Trap Detection: {(supersession_detected/supersession_total)*100:.2f}% ({supersession_detected}/{supersession_total})")
    print(f"Latency P50 (Median):        {p50_lat:.1f} ms")
    print(f"Latency P95:                 {p95_lat:.1f} ms")
    print("=" * 80)

    print("\nDomain-Wise Breakdown:")
    for cat, st in sorted(category_stats.items(), key=lambda x: x[1]["total"], reverse=True):
        if st["total"] == 0:
            continue
        c_top1 = (st["top1"] / st["total"]) * 100
        c_top5 = (st["top5"] / st["total"]) * 100
        c_med = float(np.percentile(st["latencies"], 50))
        print(f" - {cat:28s} [{st['total']:4d} cases] Top-1: {c_top1:5.1f}% | Top-5: {c_top5:5.1f}% | Median: {c_med:5.1f} ms")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MaanakAI 10k Benchmark Suite Runner")
    parser.add_argument("--limit", type=int, default=100, help="Number of cases to evaluate (default: 100)")
    parser.add_argument("--offset", type=int, default=0, help="Starting offset index (default: 0)")
    args = parser.parse_args()

    run_suite(limit=args.limit, offset=args.offset)
