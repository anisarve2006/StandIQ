# MaanakAI — Complete SIH Project Report (Part 1 of 2)
## AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications
### Smart India Hackathon 2026 | Problem Statement: SIH PS108
### Organization: Ministry of Consumer Affairs, Food & Public Distribution | Bureau of Indian Standards (BIS)

---

> **System:** MaanakAI v3.0.0  |  **Team:** StandIQ
> **Key Metrics:** 96.7% Top-1 Accuracy | 100% Top-5 Recall | 100% Zero-Hallucination | 516ms Avg Latency
> **Corpus:** 19,423 Authentic BIS Standards | 2,246 Live QCOs | 14,656 Knowledge Graph Edges

---

## Table of Contents — Part 1 (Sections 1–6)

1. Executive Summary
2. Problem Statement — Deep Analysis
3. Why Existing Solutions Fail
4. MaanakAI — Solution Overview & Philosophy
5. System Architecture — Bird's Eye View
6. Layer-by-Layer Technical Deep Dive
   - Layer 1: PDF & BoQ Ingestion Engine
   - Layer 2: Neuro-Symbolic Query Compiler
   - Layer 3: Multilingual & Indic Language Processing
   - Layer 4: Parallel 3-Way Hybrid Retrieval
   - Layer 5: Reciprocal Rank Fusion (RRF)
   - Layer 6: ColBERT Late-Interaction Reranker
   - Layer 7: Technical Constraint & Contradiction Engine
   - Layer 8: Standards Knowledge Graph
   - Layer 9: Agentic Completeness Loop
   - Layer 10: Structured Evidence Pack Builder
   - Layer 11: Zero-Hallucination Verification Kernel
   - Layer 12: LLM Synthesis & Tender Clause Generator

*(Sections 7–18: Data Pipeline, Database, API, Frontend, BharatGPT, Deployment, Benchmarks, Competitive Differentiation, Impact, Scalability, Roadmap, Conclusion — see Part 2)*

---

## 1. Executive Summary

India's government procurement ecosystem processes **lakhs of tenders every year** through platforms like the Government e-Marketplace (GeM) and the Central Public Procurement Portal (CPPP). Every tender requires the procurement official to correctly identify and cite the applicable **Bureau of Indian Standards (BIS) Indian Standard (IS)** — the governing quality and safety specification for the product being procured.

This sounds straightforward. It is not.

The BIS catalogue contains **over 20,000 published standards** spanning 17 engineering divisions — from civil engineering to medical equipment, food and agriculture to advanced electronics. These standards are frequently revised, superseded, and amended. Many products fall under multiple overlapping standards. Mandatory certification requirements (called **Quality Control Orders or QCOs**) add another layer of regulatory complexity. India's linguistic diversity means procurement officials often submit specifications in Hindi, regional languages, or Hinglish colloquialisms.

The result? Tender specifications routinely contain:
- Outdated IS citations that were superseded years ago
- Missing mandatory QCO compliance requirements
- Incomplete allied standards (no testing method, no safety code)
- Wrong standards cited due to overlap or ambiguity
- Specifications prepared entirely without any IS reference

**MaanakAI** is our answer. It is a production-grade, **AI-powered recommendation engine** that automatically analyzes any procurement specification — whether typed in natural language, submitted as a Hindi sentence, or uploaded as a 50-page tender PDF — and returns the complete, verified, up-to-date set of applicable Indian Standards in under **516 milliseconds on average**.

The system is not a search engine. It is not a keyword matcher. It is an **end-to-end neuro-symbolic AI pipeline** with 12 distinct intelligence layers, grounded in a corpus of **19,423 real BIS standards**, **2,246 live Quality Control Orders**, and a **14,656-edge standards knowledge graph** — all scraped from official BIS and Government Gazette sources.

---

## 2. Problem Statement — Deep Analysis

### 2.1 The Procurement Standards Problem

Every year, the Government of India processes procurement worth several lakh crore rupees through e-procurement portals. The quality, safety, and technical correctness of procured goods is directly governed by Indian Standards. When a procurement officer incorrectly cites, omits, or uses an outdated standard, the consequences cascade:

**Consequence 1 — Procurement Disputes:**
If a vendor supplies goods conforming to an older version of a standard which the tender inadvertently cited, and the procuring agency expects the latest version, the result is a legal dispute, delay, and financial loss.

**Consequence 2 — Quality Degradation:**
When the tender omits the mandatory testing method standard (e.g., IS 2386 for aggregate testing alongside IS 383 for aggregates), the procured goods may never be subjected to proper quality testing. This directly affects infrastructure quality — roads, bridges, buildings.

**Consequence 3 — Regulatory Non-Compliance:**
The Central Government issues Quality Control Orders (QCOs) under the Bureau of Indian Standards Act, 2016. These make ISI Mark certification mandatory for certain products. If a tender does not reference the applicable QCO, non-certified (potentially unsafe) goods can enter the supply chain.

**Consequence 4 — Procurement Manipulation:**
Vague or incorrect specifications create room for manipulation — suppliers can claim their non-compliant goods meet the incorrectly cited standard.

### 2.2 The Scale of the Challenge

- BIS has published **~20,500+ standards** across 17 technical departments
- Standards are organized into families, parts, sections, and amendments — a complex identification space
- Many standards have overlapping scope (e.g., IS 4985 and IS 12235 both cover PVC pipes for water supply)
- QCOs have been issued for **over 600 product categories**, each with specific gazette notification references
- A single procurement document may reference 10–30 different standards
- The official BIS portal provides only basic keyword search — no intelligence, no context, no allied standards

### 2.3 The Human Bottleneck

A typical procurement officer:
- Is not a subject-matter expert in BIS standards
- Does not have time to manually scan 20,000+ standards
- Cannot easily verify whether a cited standard is the latest version
- Does not know which allied test/safety standards accompany the primary product standard
- May draft specifications in Hindi or a regional language

This is precisely the gap that MaanakAI fills — bringing **expert-level BIS knowledge** to every procurement desk in India, instantly.

---

## 3. Why Existing Solutions Fail

Before designing MaanakAI, we analyzed how competing teams and existing tools approach this problem. The failure modes are systematic.

### 3.1 Toy Dataset Problem
Teams build retrieval systems over a manually curated subset of 4–90 standards. This works in demos but collapses when exposed to the real BIS catalogue of 19,423+ standards. Our system was built, tested, and validated against the **full authentic corpus from day one**.

### 3.2 Dense-Only Vector Search
Many teams use only dense vector embeddings (FAISS, ChromaDB, Pinecone). While these capture semantic meaning, they systematically fail on:
- **Alphanumeric codes:** `IP65`, `IS:1786`, `Fe 500D`, `11 kV` are semantically meaningless to a vector model
- **Exact part numbers:** A query for `IS 1239 Part 1` should not return `IS 1239 Part 2`
- **Specification parameters:** `Grade M25 concrete` and `Grade M30 concrete` have very similar embeddings but map to different standards

MaanakAI uses **hybrid retrieval** — combining exact ID matching, BM25 lexical search, and dense vectors through Reciprocal Rank Fusion.

### 3.3 No Reranker — Static Weighting
After retrieval, most systems return a linearly weighted ranked list. This fails when the query intent shifts. A query about "testing of steel bars" should surface IS 1786 for the product but also IS 1608 for the tensile test method. MaanakAI's **ColBERT MaxSim late-interaction reranker** resolves this through token-level alignment.

### 3.4 Fake Multilingualism
Google Translate garbles engineering terminology — "सरिया" (sariya, Hindi for TMT steel rebar) gets translated as "iron wire" or "rod", missing IS 1786. MaanakAI's **Indian Trade Lexicon** maps 300+ colloquial procurement terms across 9 Indian languages to their formal IS product titles **without any external API call**.

### 3.5 LLM Hallucinations
GPT-4 and similar LLMs confidently generate IS numbers that **do not exist**. This is catastrophic in a procurement context — officials could include fake standard citations in binding tender documents. MaanakAI's **Zero-Hallucination Verification Kernel** makes it architecturally impossible for a non-existent standard to appear in any output.

### 3.6 Missing Allied Standards
Returning only the primary product standard is insufficient. A complete procurement specification requires:
- The product standard (e.g., IS 1786 for TMT bars)
- The test method standard (e.g., IS 1608 for tensile tests)
- The safety/installation code
- The mandatory certification requirement

Most systems return only one standard. MaanakAI's **Knowledge Graph + Agentic Completeness Loop** ensures all six procurement facets are covered.

### 3.7 No Regulatory Layer
Most teams ignore QCOs entirely. For hundreds of product categories, ISI Mark certification is **legally mandatory** under the BIS Act. MaanakAI integrates **2,246 live QCOs** cross-referenced against Gazette notification numbers and effective dates.

### 3.8 Cloud Sovereignty Breaches
Sending unreleased tender documents to US-hosted cloud AI APIs breaches data sovereignty. MaanakAI's full pipeline runs **100% on-premise, air-gapped**, protecting tender confidentiality.

### 3.9 Text-Only Blindness
Cannot process PDF tenders or Excel BoQ tables. MaanakAI's **layout-aware PyMuPDF engine** with native table detection handles the complex document formats used in real government procurement.

---

## 4. MaanakAI — Solution Overview & Philosophy

### 4.1 Core Design Invariants

MaanakAI is built on four non-negotiable invariants:

**Invariant 1 — Zero Data Fabrication:**
Every IS number, QCO order, amendment, and gazette reference in any MaanakAI output traces back to official BIS or Government Gazette sources. Nothing is synthetic. Nothing is made up.

**Invariant 2 — Code Decides Facts; LLM Explains:**
The deterministic engine (Python code + SQLite queries) resolves all IS numbers, editions, and regulatory mandates. The LLM (BharatGPT or Groq) is only used to explain these facts in clear English — it never retrieves and never invents standard numbers.

**Invariant 3 — Multi-Dimensional Calibrated Confidence:**
Instead of a single black-box percentage, MaanakAI provides a **6-dimensional confidence vector**: semantic match score, technical parameter match, scope overlap ratio, knowledge graph support, version validity, and certification status.

**Invariant 4 — Air-Gap Sovereignty:**
Tender documents are sensitive government documents. MaanakAI's full retrieval pipeline runs **100% on-premise** without any external API call.

### 4.2 What MaanakAI Can Process

| Input Type | Example | Handling |
|---|---|---|
| Natural Language (English) | "Supply of 12mm Fe 500D TMT steel bars for RCC" | Direct pipeline |
| Hindi / Devanagari | "सरिया Fe-500 12 मिलीमीटर RCC निर्माण" | Script detect → Lexicon → Translate |
| Hinglish / Colloquial | "sariya ka naya tender" | Trade Lexicon mapping |
| Direct IS Number | "IS 1786" | Fast Path (O(1) lookup) |
| Tender PDF | 50-page BoQ document | PDF processor → per-item pipeline |
| Excel BoQ | Schedule of Requirements | Excel processor → per-item pipeline |
| Tamil, Telugu, Kannada | Indic script input | Multilingual engine |

### 4.3 What MaanakAI Returns

For any input, MaanakAI returns:
1. **Primary Standard** — Most applicable IS number with full metadata
2. **Version Status** — Current, superseded, or under amendment
3. **Mandatory QCO Status** — Whether ISI Mark / BIS certification is legally mandatory
4. **Allied Standards** — Test methods, safety codes, installation standards, normative references
5. **6-Factor Confidence Vector** — Calibrated multi-dimensional confidence breakdown
6. **Specification Gaps** — Technical parameters the user omitted that the standard expects
7. **Draft Tender Clause** — A ready-to-use, GeM/CPPP-compliant 5-point specification clause

---

## 5. System Architecture — Bird's Eye View

MaanakAI's architecture is a **12-layer neuro-symbolic pipeline** with two execution paths:

```
INPUT (Text / PDF / Excel / Hindi / Hinglish)
         │
         ▼
[Layer 1]  Layout-Aware PDF/BoQ Ingestion Engine (PyMuPDF)
         │
         ▼
[Layer 2]  Neuro-Symbolic Query Compiler
           ├── Deterministic Unit Extractor (V, kW, IP, Grade, Hz)
           ├── Indian Trade Lexicon (Hinglish → Formal IS title)
           └── Domain Acronym Expander (PVC → polyvinyl chloride)
         │
         ▼
[Layer 3]  Multilingual Engine
           ├── Script Detection (9 Indic scripts)
           ├── Technical Entity Guard (mask parameters)
           └── Rule-based Indic → English Translation
         │
         ▼
[Layer 4]  Parallel 3-Way Hybrid Retrieval
           ├── Path A: Exact IS ID & Trade Match (weight 3.5×)
           ├── Path B: SQLite FTS5 Multi-Tier BM25 (weight 1.2×)
           └── Path C: FastEmbed BGE Dense Semantic Search (weight 1.5×)
         │
         ▼
[Layer 5]  Reciprocal Rank Fusion (RRF, k=60)
         │
         ▼
[Layer 6]  ColBERT Late-Interaction MaxSim Reranker
         │
         ▼
[Layer 7]  Technical Constraint & Contradiction Engine
           └── Voltage, Power, Indoor/Outdoor conflict detection
         │
         ▼
[Layer 8]  Standards Knowledge Graph Traversal
           └── 14,656 edges: TEST, SAFETY, INSTALLATION, NORMATIVE, SUPERSEDES
         │
         ▼
[Layer 9]  Agentic Completeness Loop (max 2 iterations)
           └── Fills gaps: Testing, Safety, Installation, Version, Certification
         │
         ▼
[Layer 10] Structured Evidence Pack Builder
           └── 6-Factor Confidence Vector + Version & QCO Verification
         │
         ▼
[Layer 11] Zero-Hallucination Verification Kernel
           └── Hard existence & grounding checks vs. 19,423 standards catalogue
         │
         ▼
[Layer 12] LLM Synthesis — 5-Point Tender Clause Generator
           ├── Mode A: BharatGPT-3B-Indic (local GPU, sovereign)
           ├── Mode B: Groq Llama-3.3-70B (cloud)
           └── Mode C: Deterministic Template (100% offline, zero latency)
         │
         ▼
OUTPUT: Verified Tender Specification + Evidence Pack + QCO Status + Confidence Vector
```

**Execution Paths:**
- **Fast Path (<80ms):** Direct IS number citations bypass heavy layers — O(1) lookup + graph expansion
- **Complex Path (300–700ms):** Full 12-layer pipeline for natural language / PDF / multilingual queries

---

## 6. Layer-by-Layer Technical Deep Dive

---

### 6.1 Layer 1 — Layout-Aware PDF & BoQ Ingestion Engine

**Source:** `backend/retrieval/pdf_processor.py`  
**Technology:** PyMuPDF (`fitz`) v1.27.2, native C-level speed

Government tender documents come in complex PDF formats — multi-column Schedules of Requirements (BoQ), nested tables, numbered clauses, running headers/footers, and mixed languages. Standard text extraction tools fail completely on these.

**Table Detection and Extraction:**

Using PyMuPDF's `page.find_tables()` API, the engine detects and extracts multi-column BoQ tables while preserving column headers, row relationships, and item numbering:

```
Item No. | Description                          | Unit | Qty | Rate
---------|--------------------------------------|------|-----|-----
1        | TMT Fe-500D 12mm bars for RCC        | MT   | 50  | -
2        | M-25 grade PCC for foundation        | CUM  | 120 | -
3        | LED street light luminaire 80W IP65  | Nos  | 200 | -
```

Each row becomes an independent procurement item processed through the full 12-layer pipeline.

**Numbered Clause Detection:**

Regex heuristics identify procurement clauses in formats like:
- `"Item No 1: Supply of 1200m ductile iron Class K7 pipes..."`
- `"Clause 4.2: Providing and fixing LED luminaires for road lighting..."`
- `"(a) Electrical cables, PVC insulated, 2.5 sq mm conductor..."`

**Noise Filtering:**

Running headers (e.g., `"Government of Maharashtra — PWD — NIT No. 23/2024"`), page numbers, and watermarks are automatically discarded.

**Excel BoQ Support:**

Through `excel_processor.py`, the system handles `.xlsx` and `.xls` Schedules of Requirements with identical intelligence.

**Performance:** <50ms per page on CPU. A 50-page tender PDF processes in under 2.5 seconds.

---

### 6.2 Layer 2 — Neuro-Symbolic Query Compiler

**Source:** `backend/retrieval/compiler.py`

The Query Compiler converts raw natural language into a **structured technical requirement object**. It is "neuro-symbolic" because it combines deterministic rule-based logic (symbolic) with learned representations (neural).

**Component 2.1 — Deterministic Unit & Parameter Extractor:**

A pure regex-based parser extracts engineering constraints from free text:

| Parameter Type | Example Input | Extracted Output |
|---|---|---|
| Voltage | "415V three-phase supply" | `{voltage: 415, unit: "V"}` |
| Power | "15 kW induction motor" | `{power: 15, unit: "kW"}` |
| Ingress Protection | "IP65 rated enclosure" | `{ip_rating: "IP65"}` |
| Material Grade | "Fe 500D bars" | `{grade: "Fe500D"}` |
| Concrete Grade | "M-25 concrete" | `{concrete_grade: "M25"}` |
| Environment | "outdoor installation" | `{environment: "outdoor"}` |
| Frequency | "50 Hz motor" | `{frequency: 50}` |

These constraints flow to the Constraint Engine (Layer 7) to eliminate technically incompatible candidates.

**Component 2.2 — Dynamic Indian Trade Lexicon:**

A **database-backed dynamic dictionary** (stored in `standard_aliases` SQLite table, not hardcoded) resolves 300+ common Indian colloquial procurement terms:

| Colloquial Input | Formal IS Title | Standard |
|---|---|---|
| sariya | High strength deformed steel bars | IS 1786 |
| chuna | Quick lime / hydrated lime | IS 712 |
| pani ki motor | Submersible pumpset | IS 8034 |
| tmt | TMT steel bars for RCC | IS 1786 |
| ACC block | Autoclaved aerated concrete blocks | IS 2185 |
| vitrified tiles | Pressed ceramic tiles | IS 15622 |
| GI pipe | Galvanized steel tubes | IS 1239 |
| UPS | Uninterruptible power supply | IS 16242 |

New terms can be added via database insert — zero code changes required.

**Component 2.3 — Domain Acronym Expander:**

| Abbreviation | Expansion |
|---|---|
| PVC | Polyvinyl chloride |
| CPVC | Chlorinated polyvinyl chloride |
| HDPE | High density polyethylene |
| gate valve | Sluice valve (formal IS terminology) |
| induction motor | Line operated three phase AC motors |
| CCTV | Information technology equipment |

**Component 2.4 — Direct IS Number Parsing:**

```python
parse_is_identifier("IS 1239 Part 1 2016") →
{
    "family_id": "IS:1239:P1",
    "number": "1239",
    "part": "1",
    "year": 2016
}
```

This enables the **Fast Path** — a direct O(1) database lookup returning results in <80ms.

---

### 6.3 Layer 3 — Multilingual & Indic Language Processing

**Source:** `backend/retrieval/multilingual.py`

MaanakAI natively processes procurement queries in **9 Indic scripts and Romanized Hinglish** without any external translation API.

**Script Detection:**

Using Unicode character code point ranges for instant, deterministic detection:

| Script | Unicode Range | Languages Covered |
|---|---|---|
| Devanagari | U+0900–U+097F | Hindi, Marathi, Sanskrit, Nepali |
| Bengali | U+0980–U+09FF | Bengali, Assamese |
| Gujarati | U+0A80–U+0AFF | Gujarati |
| Gurmukhi | U+0A00–U+0A7F | Punjabi |
| Tamil | U+0B80–U+0BFF | Tamil |
| Telugu | U+0C00–U+0C7F | Telugu |
| Kannada | U+0C80–U+0CFF | Kannada |
| Malayalam | U+0D00–U+0D7F | Malayalam |
| Odia | U+0B00–U+0B7F | Odia |
| Latin | A–Z | English, Hinglish, Romanized Indic |

**Technical Entity Guard:**

Before translation, engineering parameters are **masked with placeholder tokens** to prevent corruption:

```
Input:     "सरिया Fe-500 12 मिलीमीटर व्यास"
Masked:    "सरिया __TECH_PARAM_0__ __TECH_PARAM_1__ मिलीमीटर व्यास"
Translated: "TMT steel bars __TECH_PARAM_0__ __TECH_PARAM_1__ mm diameter"
Unmasked:  "TMT steel bars Fe-500 12 mm diameter"
```

After translation, placeholders are **unmasked** with original values restored exactly.

**Rule-Based Cross-Lingual Lexicon (`CROSS_LINGUAL_LEXICON`):**

Maps procurement terms across Indic languages to English:
- ईंट → brick, सीमेंट → cement, तार → wire/cable, पाइप → pipe

For complex Indic sentences, the system integrates with:
- **BharatGPT-3B-Indic** (local GPU, sovereign) — primary
- **AI4Bharat IndicTrans2** (optional cloud) — secondary
- **Digital India Bhashini API** (optional) — tertiary

All integration hooks preserve masked technical entities, ensuring engineering precision survives translation.

---

### 6.4 Layer 4 — Parallel 3-Way Hybrid Retrieval

**Source:** `backend/retrieval/hybrid_search.py`

Three independent search channels execute **simultaneously** against the SQLite `standards` table and FTS5 index:

**Channel A — Exact IS ID & Trade Term Match (Weight: 3.5×):**

Direct indexed lookup with the highest RRF weight. If a user types "IS 1786" or "sariya", there is no ambiguity — this channel dominates.

```sql
SELECT family_id, raw_id, title_en, scope_text, year, division,
       committee, status, num_amendments, tier, pdf_url
FROM standards
WHERE family_id = ? OR number = ?
LIMIT 5;
```

**Channel B — Multi-Tier SQLite FTS5 BM25 Lexical Search (Weight: 1.2×):**

SQLite's FTS5 provides native BM25 ranking with a three-tier fallback:

*Tier 1 — Exact Keyphrase (highest precision):*
```sql
SELECT * FROM standards_fts
WHERE standards_fts MATCH '"TMT steel bars"'
ORDER BY rank;
```

*Tier 2 — Conjunctive AND (all terms must appear):*
```sql
SELECT * FROM standards_fts
WHERE standards_fts MATCH 'steel AND bars AND reinforcement'
ORDER BY rank;
```

*Tier 3 — Disjunctive BM25 (ranked by relevance score):*
```sql
SELECT * FROM standards_fts
WHERE standards_fts MATCH 'steel bars reinforcement'
ORDER BY rank;
```

Tiers are tried in sequence. Tier 1 results are only surfaced when a perfect phrase match exists — ensuring high precision before falling back to broader recall.

**Channel C — Dense Semantic Vector Search (Weight: 1.5×):**

Using `BAAI/bge-small-en-v1.5` running locally via ONNX Runtime through the `fastembed` library. This channel captures semantic similarity beyond keyword overlap:

1. Compiled query text → 384-dimensional dense vector
2. Cosine similarity vs. pre-embedded standard titles and scope texts
3. Normalized rescoring
4. LRU cache for zero-overhead re-queries

Example captures:
- "water pipe for drinking" → IS 4985 (PVC pipes for potable water) — without keywords "PVC" or "potable"
- "concrete mixing design" → IS 456 (Plain and Reinforced Concrete) — via semantic understanding

---

### 6.5 Layer 5 — Reciprocal Rank Fusion (RRF)

After three channels return independent ranked lists (up to 30 candidates each), **Reciprocal Rank Fusion** merges them:

```
RRF(d) = Σ [w_c / (60 + rank_c(d))]    for each channel c
```

| Parameter | Value | Rationale |
|---|---|---|
| Smoothing constant k | 60 | Prevents top-1 document from monopolizing the score |
| Exact/Trade weight | 3.5× | Direct IS number citation — precision dominates |
| Dense Semantic weight | 1.5× | Paraphrase and semantic equivalence |
| BM25 Lexical weight | 1.2× | Vocabulary overlap — can be noisy |

RRF is **position-based, not score-based** — more robust than learned linear combinations. A document ranked 1st in any channel gets a meaningful boost regardless of its raw score magnitude.

After fusion, the top-30 candidates are deduplicated by `family_id` and passed to the reranker.

---

### 6.6 Layer 6 — ColBERT Late-Interaction MaxSim Reranker

**Source:** `backend/retrieval/reranker.py`

Standard retrieval systems score documents as a whole against the query (single-vector similarity). ColBERT's innovation is **token-level late interaction** — computing individual token-to-token similarities, then aggregating.

**MaxSim scoring formula:**

```
MaxSim(Q, D) = (1 / |Q|) × Σ_q [ max_d Sim(q, d) ]
```

For each query token `q`, find the **most similar document token** `d`. Average these maximum similarities across all query tokens.

**Why this matters for procurement standards:**

Query: `"high voltage outdoor power distribution transformer 11kV three-phase"`

A standard dense vector computes one similarity — the dominant terms wash out nuances. ColBERT's MaxSim ensures:
- Token `"outdoor"` strongly aligns with standards specifying outdoor installation
- Token `"11kV"` aligns specifically with the 11kV transformer standard (IS 1180), not the 33kV one
- Token `"three-phase"` scores highest on three-phase-specific documents

**Additional Reranker Signals:**

| Signal | Effect |
|---|---|
| Exact Phrase Bonus | If a query phrase appears verbatim in the standard title, score multiplied |
| Channel Provenance | Exact ID (Channel A) results get a provenance bonus |
| Version Discount | CURRENT: ×1.0 \| SUPERSEDED: ×0.75 \| WITHDRAWN: ×0.40 |
| Domain Constraint Bonus | Standard's declared division matches query's inferred domain |

**Performance:** <35ms on CPU for 30 candidates.

---

### 6.7 Layer 7 — Technical Constraint & Contradiction Engine

**Source:** `backend/retrieval/constraint_engine.py`

After reranking, the Constraint Engine applies **negative evidence pruning** — eliminating candidates that contradict technical requirements extracted from the query.

**Example 1 — Indoor/Outdoor Contradiction:**
- Query: "IP65 rated outdoor cable tray for power distribution"
- Candidate: IS 3419 — Cable trays for indoor electrical installations
- Contradiction detected: query = `outdoor`, standard scope = `indoor`
- **Result: ELIMINATED**

**Example 2 — Voltage Range Contradiction:**
- Query: "415V three-phase distribution board"
- Candidate: IS 8828 — Circuit breakers for household use (rated ≤ 250V)
- Contradiction detected: 415V > 250V maximum rating
- **Result: ELIMINATED**

**Example 3 — Positive Constraint Validation:**
- Query: "submersible motor pump for clear cold water, 5 HP"
- Candidate: IS 8034 — Submersible Pumpsets for clear, cold, fresh water
- All constraints verified ✓
- **Result: PROMOTED**

This layer prevents confident recommendations of technically incompatible standards — a critical failure mode of pure semantic retrieval.

---

### 6.8 Layer 8 — Standards Knowledge Graph

**Source:** `backend/retrieval/graph_expander.py`  
**Scale:** 14,656 edges across 19,423 nodes

The Knowledge Graph is a directed graph where each node is an Indian Standard and each edge is a typed relationship:

| Edge Type | Meaning | Example |
|---|---|---|
| `TEST_METHOD` | Standard A requires testing per Standard B | IS 1786 → IS 1608 (Tensile test) |
| `SAFETY_STANDARD` | Products must comply with safety Standard B | IS 694 (PVC cable) → IS 1255 (installation code) |
| `INSTALLATION_STANDARD` | Products must be installed per Standard B | IS 14846 (sluice valve) → IS 12372 |
| `NORMATIVE_REFERENCE` | Standard A explicitly references Standard B | IS 456 → IS 383 (aggregates), IS 269 (cement) |
| `SUPERSEDES` | Standard A replaces Standard B | IS 15622:2017 supersedes IS 13630 |
| `RELATED_PRODUCT` | Closely related product standards | IS 4985 ↔ IS 15778 (CPVC pipes) |

**Graph Traversal Query:**
```sql
SELECT e.dst_family_id, e.edge_type, e.provenance, e.confidence,
       s.raw_id, s.title_en, s.year, s.status, s.division
FROM edges e
LEFT JOIN standards s ON e.dst_family_id = s.family_id
WHERE e.src_family_id = ?
LIMIT 10;
```

Retrieved in a single SQL join — sub-5ms.

**Multi-hop Traversal (depth ≤ 2):**
For standards with sparse direct connections, 2-hop traversal finds standards connected through an intermediate node. Bounded at depth 2 to prevent exponential graph explosion.

**QCO Integration (simultaneous):**
```sql
SELECT scheme, category, sr_no, raw_is_no, product_name,
       gazette_notification, status, source_url, family_id
FROM cert_rules
WHERE family_id = ? OR raw_is_no LIKE ?;
```

Returns official gazette notification number, effective date, mandatory scheme (ISI Mark, CRS, Hallmarking), and product category.

---

### 6.9 Layer 9 — Agentic Completeness Loop

**Source:** `backend/retrieval/completeness_loop.py`

After knowledge graph expansion, the Completeness Engine audits **6 essential procurement facets**:

| Facet | Checked | Required |
|---|---|---|
| **Product** | Primary standard identified? | ✅ Always |
| **Testing** | Test method standard present? | ✅ Always |
| **Safety** | Safety/fire code present? | ✅ Electrical/Mechanical |
| **Installation** | Code of practice present? | ✅ Site-installed equipment |
| **Certification** | QCO status determined? | ✅ Always |
| **Version** | Standard is CURRENT/REAFFIRMED? | ✅ Always |

**Coverage Ratio:**
```python
coverage_ratio = (covered facets) / 6
# Target: ≥ 0.80 (5 out of 6)
```

**Agentic Recovery — When Coverage < 0.80:**

The engine autonomously generates targeted sub-queries for missing facets:

*Example:*
Query: "Supply of 25mm dia TMT Fe-500D bars"
After Layer 8: Product ✅ | Testing ❌ | Safety ❌ | Installation ✅ | Certification ✅ | Version ✅

Sub-query 1: "method of test tensile strength deformed steel bars" → discovers IS 1608 ✅
Sub-query 2: "safety fire protection construction site" → discovers IS 3809 ✅

After 1 iteration: Coverage = 6/6 = 1.0 ✅

The loop runs **maximum 2 iterations** to prevent runaway computation. In practice, 95%+ of cases resolve in 0–1 iterations.

---

### 6.10 Layer 10 — Structured Evidence Pack Builder

**Source:** `backend/retrieval/evidence_pack.py`

The Evidence Pack is the **tamper-proof, structured JSON bundle** documenting every fact, citation, and reasoning step. It is the single source of truth consumed by both the Verification Kernel and the LLM synthesis layer.

**Evidence Pack Structure:**

```json
{
  "query_summary": {
    "original_query": "...",
    "compiled_query": "...",
    "extracted_entities": {"voltage": 415, "grade": "Fe500D"},
    "detected_domain": "Civil Engineering"
  },
  "primary_standard": {
    "family_id": "IS:1786",
    "raw_id": "IS 1786 : 2008",
    "title_en": "High strength deformed steel bars...",
    "year": 2008,
    "status": "CURRENT",
    "division": "Civil Engineering"
  },
  "version_verification": {
    "is_current": true,
    "edition_status": "CURRENT",
    "num_amendments": 2,
    "as_of_date": "2026-09-29"
  },
  "certification": {
    "is_mandatory": true,
    "status": "MANDATORY",
    "scheme": "ISI_MARK",
    "applicable_qco": "Steel and Steel Products QCO Order, 2021",
    "gazette_notification": "G.S.R. 556(E)"
  },
  "allied_standards": {
    "test_methods": [...],
    "safety_standards": [...],
    "installation_standards": [...],
    "normative_references": [...],
    "related_products": [...]
  },
  "confidence_vector": {
    "semantic_match": 0.94,
    "parameter_match": 0.88,
    "scope_overlap": 0.91,
    "graph_support": 1.0,
    "version_validity": 1.0,
    "certification_resolved": 1.0,
    "composite": 0.955
  },
  "specification_gaps": [
    "Bar diameter not specified — required by IS 1786 Clause 6",
    "Rib geometry grade not specified"
  ],
  "negative_evidence": []
}
```

**The 6-Factor Confidence Vector:**

| Dimension | What it measures |
|---|---|
| `semantic_match` | Cosine similarity between compiled query and standard |
| `parameter_match` | How many extracted technical parameters the standard covers |
| `scope_overlap` | Overlap between query keywords and standard's scope text |
| `graph_support` | Ratio of procurement facets covered by knowledge graph |
| `version_validity` | 1.0 CURRENT / 0.75 SUPERSEDED / 0.40 WITHDRAWN |
| `certification_resolved` | 1.0 if QCO status definitively determined |

This replaces single black-box "confidence percentages" with an interpretable, auditable breakdown.

---

### 6.11 Layer 11 — Zero-Hallucination Verification Kernel

**Source:** `backend/retrieval/verification_kernel.py`

This is MaanakAI's most critical safety layer. It makes it **architecturally impossible** for a hallucinated or fabricated IS number to appear in any output.

**Hard Invariant 1 — Existence Check:**

At startup, the kernel loads all 19,423 `family_ids` and standard numbers into memory as Python `set` objects (O(1) lookup):

```python
self.valid_family_ids: set[str]   # {"IS:1786", "IS:456", ...}
self.valid_numbers: set[str]      # {"1786", "456", ...}
```

Every generated text is scanned for IS citations via regex:
```
\b(IS(?:\s*[:\-\s]?\s*\d+(?:\s*(?:Part|Pt)?\s*\d+)?(?:\s*[:/]\s*\d{4})?))
```

Any cited number is validated:
```python
exists = (family_id in self.valid_family_ids) or (number in self.valid_numbers)
if not exists:
    # Strip: replace with [INVALID CITATION REMOVED]
    violations.append({"type": "NON_EXISTENT_STANDARD", "action": "STRIPPED"})
```

**Hard Invariant 2 — Grounding Check:**

Even if a standard exists in the BIS catalogue, it cannot appear in the output unless it was retrieved into the Evidence Pack for this specific query. Prevents LLM drift to unverified-but-real standards.

**Hard Invariant 3 — Numeric Fidelity:**

Voltage, power, and numeric parameters in generated text must match Evidence Pack values.

**Hard Invariant 4 — Certification Fidelity:**

Certification claims (e.g., "mandatory ISI Mark") must be backed by a QCO record in the Evidence Pack.

**Audit Trail:**

```json
{
  "is_verified": true,
  "strip_rate": 0.0,
  "violations": [],
  "ungrounded_citations": [],
  "sanitized_text": "..."
}
```

`strip_rate: 0.0` = zero hallucinations detected. Achieved on **100% of 60 gold cases and 100 real-world cases**.

---

### 6.12 Layer 12 — LLM Synthesis & Tender Clause Generator

**Source:** `backend/retrieval/engine.py` + `backend/services/bharatgpt_service.py`

The final layer uses the verified Evidence Pack to generate a **5-Point Compliant GeM/CPPP Tender Specification Clause**:

```
### MODEL TENDER SPECIFICATION CLAUSE (BIS COMPLIANT)

1. Governing Product Standard:
   The supplied goods shall strictly conform to IS 1786 : 2008 (High strength 
   deformed steel bars and wires for concrete reinforcement), including all 
   amendments issued by BIS up to date (in force as of 2026-09-29).

2. Regulatory & Quality Control Compliance:
   Compliance with ISI_MARK is MANDATORY pursuant to the Steel and Steel Products 
   QCO Order, 2021 (Gazette Notification: G.S.R. 556(E)). The bidder MUST 
   possess a valid BIS licence with CML number at bid submission.

3. Quality Assurance & Acceptance Testing:
   Sampling and routine acceptance tests shall be performed in accordance with 
   IS 1608 (Metallic Materials — Tensile Testing) by an NABL accredited or 
   BIS recognized testing laboratory.

4. Safety & Installation Code:
   Installation shall conform to IS 456 : 2000 (Plain and Reinforced Concrete 
   — Code of Practice), Clause 5 (Durability) and Clause 26 (Detailing).

5. Marking & Inspection Protocols:
   Each bar shall bear the ISI Mark with valid CML number. Mill test certificates 
   per IS 1786 Clause 13 are mandatory for quantities ≥ 5 MT.
```

**Three Synthesis Modes:**

| Mode | Technology | Latency | When Used |
|---|---|---|---|
| **BharatGPT Local** | 3B Indic GGUF on GPU | 300–800ms | Default — sovereign, offline |
| **Groq Cloud** | Llama-3.3-70B via API | 200–500ms | When Groq API key is configured |
| **Deterministic Template** | Pure Python string assembly | 0ms | Always-on fallback |

The deterministic template mode assembles the clause entirely from structured Evidence Pack fields — no LLM required, zero latency, 100% reproducible output. This ensures MaanakAI **always returns a complete tender clause**, even with zero internet connectivity.

---

*End of Part 1. Continue to Part 2 for: Data Pipeline, Database Architecture, API Layer, Frontend, BharatGPT, Deployment, Benchmarks, Competitive Differentiation, Real-World Impact, Scalability, Roadmap, and Conclusion.*
