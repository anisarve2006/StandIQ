# MaanakAI (मानक AI) — 75 Multi-Domain Gold Cases Evaluation Report

**Executive Summary:** Official validation report of the MaanakAI Standards Recommender Engine across authentic government procurement specifications from CPWD, State PWDs, Jal Jeevan Mission, NHAI, State Electricity Discoms, GeM, Indian Railways, and Airport Authority of India.

- **Evaluation Date:** September 2026
- **Dataset:** `gold_dataset.json` (75 Ground-Truth Government Tender Cases)
- **Hardware & Inference Environment:** Intel Core CPU (Air-Gapped Sovereign Mode, ONNX Runtime FastEmbed, SQLite FTS5)
- **Verification Kernel:** Deterministic SQLite verification against 19,423 Indian Standards and 2,246 live Gazette Quality Control Orders (QCOs)

---

## 1. Executive Metrics Summary

| Metric | Benchmark Target | MaanakAI Result | Evaluation Status |
|---|---|---|---|
| **Top-1 Accuracy** | ≥ 85.0% | **93.3%** (70/75) | PASS |
| **Top-3 Recall** | ≥ 92.0% | **100.0%** (75/75) | PASS |
| **Top-5 Recall** | ≥ 95.0% | **100.0%** (75/75) | PASS |
| **Mean Reciprocal Rank (MRR)** | ≥ 0.8800 | **0.9644** | PASS |
| **Compulsory QCO Match** | ≥ 88.0% | **73.3%** (55/75) | REVIEW |
| **Zero-Hallucination Rate** | 100.0% | **100.0%** | PASS |
| **Latency (Median p50)** | < 1,500 ms | **2742.6 ms** | REVIEW |
| **Latency (p95)** | < 3,500 ms | **12937.6 ms** | REVIEW |

---

## 2. Domain-Wise Accuracy Breakdown

| Engineering Division / Procurement Domain | Cases | Top-1 Accuracy | Top-3 Recall | Top-5 Recall | Median Latency |
|---|---|---|---|---|---|
| **Chemical & Safety** | 6 | 100.0% | 100.0% | 100.0% | 2204.0 ms |
| **Civil Engineering** | 12 | 75.0% | 100.0% | 100.0% | 2771.3 ms |
| **Electronics and IT** | 4 | 75.0% | 100.0% | 100.0% | 2200.3 ms |
| **Electrotechnical** | 10 | 100.0% | 100.0% | 100.0% | 2530.3 ms |
| **Food and Agriculture** | 4 | 100.0% | 100.0% | 100.0% | 2293.1 ms |
| **Mechanical Engineering** | 9 | 88.9% | 100.0% | 100.0% | 2568.8 ms |
| **Medical and Healthcare** | 4 | 100.0% | 100.0% | 100.0% | 2545.3 ms |
| **Multilingual Indic** | 25 | 100.0% | 100.0% | 100.0% | 5947.4 ms |
| **Textiles** | 1 | 100.0% | 100.0% | 100.0% | 2454.5 ms |

---

## 3. Agency-Wise Procurement Breakdown

| Procuring Authority / Agency | Cases Evaluated | Top-1 Precision | Top-3 Coverage |
|---|---|---|---|
| Government Procurement | 75 | 93.3% | 100.0% |

---

## 4. Itemized Evaluation Audit Log

| Case ID | Procuring Agency & Item | Expected Standard | Top-1 Retrieved Standard | Rank | QCO Mandate | Verification |
|---|---|---|---|---|---|---|
| `CASE-01` | Government Procurement: CASE-01 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-02` | Government Procurement: CASE-02 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-03` | Government Procurement: CASE-03 | `IS:8112` | `IS:269` | **Rank 2** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-04` | Government Procurement: CASE-04 | `IS:12269` | `IS:269` | **Rank 2** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-05` | Government Procurement: CASE-05 | `IS:1489:P1` | `IS:1489:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-06` | Government Procurement: CASE-06 | `IS:712` | `IS:712` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-07` | Government Procurement: CASE-07 | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-08` | Government Procurement: CASE-08 | `IS:1239:P1` | `IS:1239:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-09` | Government Procurement: CASE-09 | `IS:456` | `IS:456` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-10` | Government Procurement: CASE-10 | `IS:303` | `IS:303` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-11` | Government Procurement: CASE-11 | `IS:2925` | `IS:2925` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-12` | Government Procurement: CASE-12 | `IS:1180:P1` | `IS:1180:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-13` | Government Procurement: CASE-13 | `IS:374` | `IS:374` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-14` | Government Procurement: CASE-14 | `IS:16102:P1` | `IS:16102:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-15` | Government Procurement: CASE-15 | `IS:10322:P5:S3` | `IS:10322:P5:S3` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-16` | Government Procurement: CASE-16 | `IS:694` | `IS:694` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-17` | Government Procurement: CASE-17 | `IS:7098:P1` | `IS:7098:P2` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-18` | Government Procurement: CASE-18 | `IS:12615` | `IS:12615` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-19` | Government Procurement: CASE-19 | `IS:13779` | `IS:13779` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-20` | Government Procurement: CASE-20 | `IS:12640:P1` | `IS:12640:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-21` | Government Procurement: CASE-21 | `IS:13947:P2` | `IS:13947:P5:S2` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-22` | Government Procurement: CASE-22 | `IS:8034` | `IS:8034` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-23` | Government Procurement: CASE-23 | `IS:8034` | `IS:8034` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-24` | Government Procurement: CASE-24 | `IS:9079` | `IS:9079` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-25` | Government Procurement: CASE-25 | `IS:15683` | `IS:15683` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-26` | Government Procurement: CASE-26 | `IS:3601` | `IS:3601` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-27` | Government Procurement: CASE-27 | `IS:6455` | `IS:6456` | **Rank 2** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-28` | Government Procurement: CASE-28 | `IS:14846` | `IS:14846` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-29` | Government Procurement: CASE-29 | `IS:10001` | `IS:10001` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-30` | Government Procurement: CASE-30 | `IS:3196:P1` | `IS:3196:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-31` | Government Procurement: CASE-31 | `IS:15298:P2` | `IS:15298:P2` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-32` | Government Procurement: CASE-32 | `IS:15298:P2` | `IS:15298:P2` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-33` | Government Procurement: CASE-33 | `IS:9034` | `IS:9034` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-34` | Government Procurement: CASE-34 | `IS:11883` | `IS:11883` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-35` | Government Procurement: CASE-35 | `IS:1061` | `IS:1061` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-36` | Government Procurement: CASE-36 | `IS:1065` | `IS:1065` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-37` | Government Procurement: CASE-37 | `IS:13252:P1` | `IS:13252:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-38` | Government Procurement: CASE-38 | `IS:13252:P1` | `IS:13252:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-39` | Government Procurement: CASE-39 | `IS:16242:P1` | `IS:9815:P1` | **Rank 2** | Discrepancy | Verified Zero-Hallucination |
| `CASE-40` | Government Procurement: CASE-40 | `IS:616` | `IS:616` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-41` | Government Procurement: CASE-41 | `IS:14543` | `IS:14543` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-42` | Government Procurement: CASE-42 | `IS:13428` | `IS:13428` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-43` | Government Procurement: CASE-43 | `IS:2052` | `IS:2052` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-44` | Government Procurement: CASE-44 | `IS:5406` | `IS:5406` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-45` | Government Procurement: CASE-45 | `IS:13422` | `IS:13422` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-46` | Government Procurement: CASE-46 | `IS:16289` | `IS:16289` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-47` | Government Procurement: CASE-47 | `IS:15113` | `IS:15113` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-48` | Government Procurement: CASE-48 | `IS:10258` | `IS:10258` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `CASE-49` | Government Procurement: CASE-49 | `IS:5405` | `IS:5405` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-50` | Government Procurement: CASE-50 | `IS:1566` | `IS:432:P1` | **Rank 3** | Discrepancy | Verified Zero-Hallucination |
| `CASE-51` | Government Procurement: CASE-51 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-52` | Government Procurement: CASE-52 | `IS:8112` | `IS:8112` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-53` | Government Procurement: CASE-53 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-54` | Government Procurement: CASE-54 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-55` | Government Procurement: CASE-55 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-56` | Government Procurement: CASE-56 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-57` | Government Procurement: CASE-57 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-58` | Government Procurement: CASE-58 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-59` | Government Procurement: CASE-59 | `IS:1417` | `IS:1417` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-60` | Government Procurement: CASE-60 | `IS:15683` | `IS:15683` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-61` | Government Procurement: CASE-61 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-62` | Government Procurement: CASE-62 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-63` | Government Procurement: CASE-63 | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-64` | Government Procurement: CASE-64 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-65` | Government Procurement: CASE-65 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-66` | Government Procurement: CASE-66 | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-67` | Government Procurement: CASE-67 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-68` | Government Procurement: CASE-68 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-69` | Government Procurement: CASE-69 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-70` | Government Procurement: CASE-70 | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-71` | Government Procurement: CASE-71 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-72` | Government Procurement: CASE-72 | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-73` | Government Procurement: CASE-73 | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `CASE-74` | Government Procurement: CASE-74 | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `CASE-75` | Government Procurement: CASE-75 | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |

---

## 5. Architectural Guarantees & Verification
- **Mathematical Hallucination Prevention:** The Verification Kernel intercepts all LLM and vector search outputs. Every standard code emitted in the final recommendation is verified against SQLite primary keys in `standards.db`.
- **5-Category Allied Standards Integration:** All related testing procedures (IS 1608, IS 4031), installation practices, and safety codes are dynamically traversed and classified.
- **Regulatory Compliance Reliability:** Mandatory QCO mandates are cross-checked against official Ministry Gazette orders (Steel QCO, Cement QCO, Cables QCO, BIS Scheme-I), preventing non-compliant government tender awards.
