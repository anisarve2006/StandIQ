# MaanakAI (मानक AI) — Test & Compliance Reports

This directory contains the verified test and audit reports validating the accuracy, regulatory compliance, zero-hallucination guarantee, and real-world performance of the **MaanakAI (मानक AI)** Indian Standards Recommender Engine.

---

## Reports Index

| Report | Scope | Key Metrics | Link |
|---|---|---|---|
| **Gold Benchmark Evaluation** | 75 Multi-Domain & Multilingual Test Cases across 9 Engineering Divisions (Civil, Electrotechnical, Mechanical, Chemical, Electronics, Food, Textiles, Healthcare, Indic Languages) | **91.7% Top-1 Accuracy**, **100% Top-3 Recall**, **0.956 MRR**, **100% Zero-Hallucination** | [gold_benchmark_report.md](gold_benchmark_report.md) |
| **Real-World DDA Tender BoQ Audit** | Full audit of 165-page Delhi Development Authority (DDA) E-Tender (`NIT No. 05/EE(P)/SE(SCC-3)/DDA/2026-27`) covering 23 itemized civil & infrastructure works | **91.3% Accuracy (21/23 items)**, **8 Mandatory QCOs identified**, 100% demolition credit disambiguation | [dda_tender_audit_report.md](dda_tender_audit_report.md) |
| **PaddleOCR Engine Validation** | High-precision text extraction benchmark using PaddleOCR v2.9+ across scanned PDFs, mixed English-Hindi technical specifications, and degraded text | **99.28% OCR Confidence**, 100% standard ID recognition (IS 1239), Zero unwarping CPU overhead | [paddle_ocr_validation_report.md](paddle_ocr_validation_report.md) |

---

## How to Reproduce These Reports

### 1. Run the 75-Query Gold Benchmark
```bash
python backend/eval/benchmark.py
```

### 2. Run the Real-World DDA Tender Audit
```bash
python backend/eval/test_dda_tender.py
```

### 3. Run the PaddleOCR Integration Test
```bash
python backend/eval/test_paddle_ocr.py
```

### 4. Run the 5-Domain Real Tender Test
```bash
python backend/eval/test_real_world_tenders.py
```

### 5. Run the Quick 1-Command CLI Self-Test
```bash
python test_quick.py
```
