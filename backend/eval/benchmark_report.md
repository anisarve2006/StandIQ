# Indian Standards Recommender — Gold Benchmark Report

**Evaluation Date:** 25 September 2026
**Benchmark Dataset:** 50 multi-domain procurement cases (`eval/gold_dataset.json`)
**Hardware:** Intel Iris Xe (CPU-only, ONNX runtime FastEmbed, SQLite FTS5)

## 1. Executive Metrics Summary

| Metric | Target | Result | Status |
|---|---|---|---|
| **Top-1 Accuracy** | ≥ 80.0% | **91.7%** | PASS |
| **Top-3 Recall** | ≥ 90.0% | **100.0%** | PASS |
| **Top-5 Recall** | ≥ 95.0% | **100.0%** | PASS |
| **Mean Reciprocal Rank (MRR)** | ≥ 0.85 | **0.9556** | PASS |
| **Compulsory QCO Match** | ≥ 85.0% | **80.0%** | FAIL |
| **Zero-Hallucination Rate** | 100.0% | **100.0%** | PASS |
| **Latency p50 (Median)** | < 1500 ms | **3413.2 ms** | REVIEW |
| **Latency p95** | < 4000 ms | **12219.8 ms** | REVIEW |

## 2. Domain-Wise Accuracy Breakdown

| Engineering Division | Cases | Top-1 | Top-3 | Top-5 | Median Latency |
|---|---|---|---|---|---|
| Chemical & Safety | 6 | 100.0% | 100.0% | 100.0% | 3153.1 ms |
| Civil Engineering | 12 | 75.0% | 100.0% | 100.0% | 3476.3 ms |
| Electronics and IT | 4 | 75.0% | 100.0% | 100.0% | 3385.8 ms |
| Electrotechnical | 10 | 100.0% | 100.0% | 100.0% | 3273.9 ms |
| Food and Agriculture | 4 | 100.0% | 100.0% | 100.0% | 2975.6 ms |
| Mechanical Engineering | 9 | 88.9% | 100.0% | 100.0% | 3435.8 ms |
| Medical and Healthcare | 4 | 100.0% | 100.0% | 100.0% | 3690.5 ms |
| Multilingual Indic | 10 | 100.0% | 100.0% | 100.0% | 7353.7 ms |
| Textiles | 1 | 100.0% | 100.0% | 100.0% | 3280.8 ms |

## 3. Architecture Validation Notes
- **Zero-Hallucination Guarantee:** The Verification Kernel verified 100% of all generated IS numbers against `standards.db`. Zero synthetic or hallucinated standards were admitted into any output clause.
- **Allied Graph & Completeness:** Bounded graph expansion automatically populated normative test methods and safety practices.
- **Regulatory Grounding:** Compulsory Certification status was deterministically cross-referenced against the 2,246 live BIS Quality Control Orders scraped from official Gazette notifications.
