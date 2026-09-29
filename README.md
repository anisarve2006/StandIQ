# MaanakAI (मानक AI)
### Intelligent Indian Standards (BIS) Recommender & Procurement Compliance Engine
**Smart India Hackathon (SIH) | Problem Statement: 26108**  
*Ministry of Consumer Affairs, Food & Public Distribution — Bureau of Indian Standards (BIS)*

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![PaddleOCR](https://img.shields.io/badge/PaddleOCR-v2.9%2B-red.svg)](https://github.com/PaddlePaddle/PaddleOCR)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Problem Statement & Background

Government departments, Public Sector Enterprises (PSEs), state infrastructure agencies (CPWD, DDA, NHAI, Discoms), and private entities procure lakhs of crores of engineering goods and civil services annually via the **Government e-Marketplace (GeM)** and national e-procurement portals.

Procurement officials are legally mandated under GFR Rule 144(i) and DPIIT directives to reference applicable **Indian Standards (IS)** and enforce mandatory **Quality Control Orders (QCO)**. However, identifying the correct standard is severely challenged by:
1. **Massive Catalogue Volume:** Over 22,000+ active standards published across 14 technical divisions.
2. **Overlapping Scopes & Frequent Amendments:** Confusing product categories (e.g., ordinary vs high-strength rebar, structural hollow sections vs water tubes).
3. **Complex Regulatory Mandates:** Misclassifying voluntary standards as compulsory, or omitting mandatory QCOs under BIS Scheme I (ISI Mark) or Scheme II (CRS).
4. **Multimodal / Scanned Tender Files:** BoQ tables often locked inside low-resolution or mixed-language scanned PDFs.
5. **Trade Slang & Language Barriers:** Search queries filed in informal vernacular (e.g., Hinglish *"12mm sariya"*, Marathi *"लोखंडी गज"*, Tamil *"கம்பி"*).

**MaanakAI (मानक AI)** is an intelligent, high-precision recommendation and regulatory compliance engine that ingests raw product descriptions or full multi-page tender PDFs, maps the ground-truth Indian Standards, surfaces cross-referenced normative testing codes, verifies mandatory QCO mandates, and generates audit-ready tender specification clauses.

---

## 2. Key System Capabilities

### A. Multi-Stage Hybrid Retrieval & Constraint Engine
- **FTS5 Lexical Search (BM25):** Sub-millisecond full-text lexical indexing over 19,423 standards.
- **Dense Semantic Embeddings:** 384-dimensional dense vector embeddings with Reciprocal Rank Fusion (RRF).
- **Deterministic Numerical Constraint Engine:** Extracts and enforces physical constraints (e.g., diameter `12mm`, voltage `415V`, pressure `5 MPa`, yield strength `Fe 500D`), eliminating mismatched classifications.

### ️ B. Zero-Hallucination Verification Kernel
- Hard mathematical invariant checking: **Every cited standard number in final output is verified against the canonical local database (`standards.db`)**.
- Rejection threshold for synthetic citations: Ensures zero invented standards reach procurement tenders.

### ️ C. Grounded Regulatory Intelligence (QCO Engine)
- **Eliminates Unsafe Assumptions:** Rejects the flawed logic that *"Standard exists $\implies$ Voluntary/Mandatory"*.
- **Official Gazette Grounding:** Cross-references every standard against **2,257 in-force Quality Control Orders (QCO)** with Ministry order titles, effective enforcement dates, and verified product scopes (DPIIT Steel, Cement, Chemicals, MeitY CRS, BIS Scheme-I).

### D. Multimodal Tender Ingestion with PaddleOCR v2.9+
- Native support for scanned multi-page tender PDFs (CPWD/DDA formats) with embedded table parsing and Schedule of Quantities (BoQ) extraction.
- High-precision **PaddleOCR** pipeline with automatic orientation/angle classification (`use_angle_cls=True`) achieving **99.28% OCR confidence** without heavy GPU requirements.

### E. Multilingual Indic Trade Lexicon & Entity Guard
- Bridges colloquial trade language to technical BIS terminology across **Hindi, Marathi, Tamil, Telugu, and Hinglish**.
- **Entity Guard Preservation:** Automatically isolates and shields technical engineering tokens (e.g., `Grade 43`, `Fe 500D`, `36W LED`, `3-phase`) from being distorted during transliteration/translation.

### F. Modern Interactive Procurement Workspace
- Production-grade React 18 + TypeScript web application built with clean modular design.
- Features include: Live Tender Health Auditor, Contradiction Detection, BoQ Upload & Compliance Matrix, Interactive Knowledge Graph Visualizer, Standards Basket, and One-Click GeM-ready Tender Export (Markdown / PDF).

---

## ️ 3. Detailed System Architecture & Data Pipeline

MaanakAI is engineered as an **Air-Gapped, Neuro-Symbolic Multi-Path Retrieval & Regulatory Verification Engine**. It deliberately separates deterministic legal/catalog facts from generative natural language explanations to guarantee 100% auditable correctness.

---

### ️ High-Level System Architecture Diagram (Text & GitHub Readable)

```text
+---------------------------------------------------------------------------------------------------------+
|                                    MAANAKAI END-TO-END PIPELINE ARCHITECTURE                            |
+---------------------------------------------------------------------------------------------------------+
                                                     │
                                   [ INPUT: Query / Tender PDF / BoQ ]
                                                     │
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 1: MULTIMODAL INGESTION LAYER                                                                     |
|  • PyMuPDF (fitz): Fast C-level extraction for digital PDFs, table geometry (<35 ms/page)              |
|  • PaddleOCR v2.9+: 150 DPI render fallback, DBNet text detection + SVTR recognition, angle correction   |
+---------------------------------------------------------------------------------------------------------+
                                                     │  (Raw BoQ Line Items / Natural Text)
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 2: NEURO-SYMBOLIC QUERY COMPILER & ENTITY GUARD                                                   |
|  • Procurement Archetype Classifier: Material Supply vs Civil Demolition vs Salvage Scrap Credit        |
|  • Indian Trade Lexicon: Hinglish ("sariya"), Marathi ("लोखंडी गज"), Tamil ("கம்பி"), Hindi              |
|  • Entity Guard: Protects numbers & engineering units (12mm, 415V, Fe 500D) from transliteration error  |
+---------------------------------------------------------------------------------------------------------+
                                                     │  (Normalized Canonical English + Constraints)
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 3: 3-WAY PARALLEL HYBRID RETRIEVAL (standards.db: 19,423 BIS Standards)                           |
|  ┌────────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────────┐         |
|  │ PATH A: EXACT IS LOOKUP    │  │ PATH B: SQLITE FTS5 (BM25) │  │ PATH C: DENSE FAST-EMBED   │         |
|  │ • Regex IS ID parser       │  │ • Tier 1: Adjacent Phrase  │  │ • BAAI/bge-small-en-v1.5   │         |
|  │ • Direct Primary Key O(1)  │  │ • Tier 2: Conjunctive AND  │  │ • 384-dim ONNX CPU runtime │         |
|  │ • Family lookup ("IS 1786")│  │ • Tier 3: BM25 score rank  │  │ • In-memory LRU cache      │         |
|  └────────────────────────────┘  └────────────────────────────┘  └────────────────────────────┘         |
|                                                │                                                        |
|                                                                                                        |
|                 RECIPROCAL RANK FUSION (RRF, k=60): Exact (3.5) + Dense (1.5) + Lexical (1.2)           |
+---------------------------------------------------------------------------------------------------------+
                                                     │  (Top-30 Candidate Standards)
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 4: LATE-INTERACTION RE-RANKING & TECHNICAL CONSTRAINTS                                            |
|  • ColBERT Token-Level MaxSim: MaxSim(Q, D) = 1/|Q| ∑ max Sim(q_i, d_j) across title & scope tokens    |
|  • Lifecycle Age Penalty: CURRENT (1.0x) | SUPERSEDED (0.75x) | WITHDRAWN (0.40x)                       |
|  • Contradiction Engine: Prunes environment conflicts (indoor vs outdoor) & out-of-range specs         |
+---------------------------------------------------------------------------------------------------------+
                                                     │  (Ranked Top Standards)
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 5: STANDARDS KNOWLEDGE GRAPH & AGENTIC COMPLETENESS                                               |
|  • 14,656 Directed Graph Edges: TESTED_BY (testing), CITED_IN (design codes), SAFETY_CODE (safety)      |
|  • Agentic Completeness Loop: Audits 6 facets (Product, Grade, Dimensions, Testing, Safety, QCO)        |
|  • Targeted Micro-Retrieval: Automatically fetches missing allied testing & safety standards            |
+---------------------------------------------------------------------------------------------------------+
                                                     │  (Structured Evidence Pack)
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 6: GROUNDED REGULATORY INTELLIGENCE (2,257 Live Gazette QCO Orders)                               |
|  • Gazette Notification Mapping: S.O. Order Number, Effective Date, Line Ministry (DPIIT, Steel, MeitY)|
|  • Certification Schemes: BIS Scheme I (Compulsory ISI Mark) vs Scheme II (CRS Registration)            |
|  • Zero-Assumption Safety Fallback: "NOT_VERIFIED" if product scope lacks official gazette evidence     |
+---------------------------------------------------------------------------------------------------------+
                                                     │  (Grounded Legal & Technical Dossier)
                                                     
+---------------------------------------------------------------------------------------------------------+
| STAGE 7: ZERO-HALLUCINATION VERIFICATION KERNEL & SYNTHESIS                                             |
|  • 100% Hard Existence Invariant: Every IS number cited in output must exist in standards.db (19,423)   |
|  • Non-existent / invented citations are strictly stripped and logged in compliance audit report       |
|  • 5-Point GeM Tender Clause: Model tender specification ready for public procurement bidding           |
+---------------------------------------------------------------------------------------------------------+
                                                     │
                                   [ AUDIT-READY VERIFIED OUTPUT / REACT UI ]
```

<details>
<summary><b> Click to view interactive Mermaid Graph Diagram</b></summary>

```mermaid
graph TD
    subgraph IngestionLayer ["1. Multimodal Document Ingestion & Vision Layer"]
        PDF["Tender PDF / BoQ Document<br/>(Scanned, Digital, or Mixed)"]
        Query["Raw Natural Language Spec<br/>(English / Indic / Vernacular)"]
        
        PyMuPDF["PyMuPDF (fitz) Parser<br/>- C-level Table Grid Extractor<br/>- BoQ Row/Column Geometry<br/>- Layout & Header Filtering"]
        PaddleOCR["PaddleOCR v2.9+ Engine<br/>- DBNet Text Detection<br/>- SVTR Multi-Script Recognition<br/>- 180° Direction Classifier<br/>- CPU Inference (<1.5s/page)"]
        
        PDF --> PyMuPDF
        PDF -->|Scanned / Non-searchable| PaddleOCR
        PyMuPDF --> RawItems["Segmented BoQ Line Items"]
        PaddleOCR --> RawItems
    end

    subgraph NormalizationLayer ["2. Neuro-Symbolic Query Compiler & Entity Guard"]
        RawItems --> Compiler["Query Compiler & Normalizer<br/>(retrieval/compiler.py)"]
        Query --> Compiler
        
        TradeLexicon["Indian Trade Lexicon<br/>- Hinglish: 'sariya', 'chuna'<br/>- Marathi: 'लोखंडी गज'<br/>- Tamil: 'கம்பி'<br/>- Hindi Devanagari"]
        EntityGuard["Entity & Numerical Guard<br/>- Preserves Units: mm, kV, MPa<br/>- Preserves Grades: Fe 500D, M25<br/>- Prevents Garbled Translations"]
        ArchetypeClassifier["Procurement Archetype Classifier<br/>- Material Procurement<br/>- Civil Service / Labor<br/>- Demolition Scrap Credit (Disambiguated)"]
        
        Compiler --> TradeLexicon
        Compiler --> EntityGuard
        Compiler --> ArchetypeClassifier
        ArchetypeClassifier --> CleanQuery["Normalized Query Object<br/>- Canonical English Text<br/>- Numerical Constraints Dict<br/>- Target Archetype Tag"]
    end

    subgraph RetrievalLayer ["3. Three-Way Parallel Hybrid Candidate Retrieval"]
        CleanQuery --> PathA["Path A: Exact ID & Trade Match<br/>- Regex IS Number Extraction<br/>- Direct Primary Key Lookup<br/>- O(1) Family Indexing"]
        CleanQuery --> PathB["Path B: Multi-Tier SQLite FTS5<br/>- Tier 1: Adjacent Phrase Match<br/>- Tier 2: Conjunctive Boolean AND<br/>- Tier 3: Disjunctive BM25 Ranking"]
        CleanQuery --> PathC["Path C: Dense Semantic Vectors<br/>- FastEmbed BGE-small-en-v1.5<br/>- 384-dimensional Embeddings<br/>- Local ONNX Runtime (CPU)<br/>- In-Memory LRU Vector Cache"]
        
        PathA --> RRF["Reciprocal Rank Fusion (RRF, k=60)<br/>RRF(d) = ∑ w_c / (60 + rank_c(d))<br/>Weights: Exact 3.5 | Dense 1.5 | Lexical 1.2"]
        PathB --> RRF
        PathC --> RRF
        RRF --> Candidates["Top-30 Candidate Standards"]
    end

    subgraph RerankingLayer ["4. Late-Interaction Re-ranking & Constraint Filter"]
        Candidates --> ColBERT["ColBERT Token-Level MaxSim Reranker<br/>MaxSim(Q, D) = 1/|Q| ∑ max Sim(q_i, d_j)<br/>- Token Alignment Across Titles & Scopes<br/>- Lifecycle Decay (Superseded: 0.75, Withdrawn: 0.40)"]
        
        ColBERT --> ConstraintFilter["Deterministic Constraint Engine<br/>- Dimension Range Checks (e.g. 100mm in 15-150mm)<br/>- Voltage / Power Verification<br/>- Negative Evidence (Indoor vs Outdoor Conflict)"]
        ConstraintFilter --> TopCandidates["Ranked Top-N Applicable Standards"]
    end

    subgraph GraphLayer ["5. Standards Knowledge Graph & Completeness Loop"]
        TopCandidates --> GraphExpander["Knowledge Graph Expansion<br/>(14,656 Directed Graph Edges)<br/>- Normative References (CITED_IN)<br/>- Acceptance Testing Codes (TESTED_BY)<br/>- Safety & Installation Practices (SAFETY_CODE)<br/>- Lifecycle Successors (SUPERSEDED_BY)"]
        
        GraphExpander --> CompletenessLoop["Agentic Completeness Loop<br/>- Audits 6 Facets: Product, Grade, Testing, Safety, QCO, Life-cycle<br/>- Spawns Sub-queries for Missing Facets (Max 2 Hops)"]
        CompletenessLoop --> EvidencePack["Structured Evidence Pack<br/>- Primary Standard Spec & Year<br/>- Linked Testing & Safety Codes<br/>- 6-Factor Confidence Vector"]
    end

    subgraph RegulatoryLayer ["6. Grounded Regulatory Intelligence (QCO Engine)"]
        EvidencePack --> QCOEngine["Regulatory Compliance Repository<br/>(2,257 In-Force Gazette Orders)<br/>- Exact IS Number & Scope Match<br/>- Line Ministry (DPIIT, Steel, MeitY, MoHUA)<br/>- Gazette Notification S.O. Number & Date<br/>- Scheme-I (ISI Mark) vs Scheme-II (CRS)<br/>- Zero-Assumption Safety Fallback ('NOT_VERIFIED')"]
        QCOEngine --> GroundedEvidence["Fully Grounded Legal & Technical Dossier"]
    end

    subgraph VerificationLayer ["7. Zero-Hallucination Verification Kernel & Output"]
        GroundedEvidence --> Synthesis["Deterministic / LLM Clause Generator<br/>- 5-Point GeM-Compliant Specification Clause<br/>- Acceptance Criteria & Inspection Protocol<br/>- Offline Template or Groq Llama-3.3-70B"]
        
        Synthesis --> VerificationKernel["Zero-Hallucination Verification Kernel<br/>(Hard Mathematical Invariant Checking)<br/>- Parses all standard citations in output<br/>- Asserts 100% membership in standards.db (19,423 records)<br/>- Strips invalid or hallucinated standard numbers"]
        
        VerificationKernel --> VerifiedOutput["Audit-Ready Output & API Response<br/>- Primary Standard with Year & Status<br/>- Mandatory QCO Mandate & Gazette Order<br/>- Cross-Referenced Testing Standards<br/>- 5-Point GeM Tender Clause<br/>- Verification Audit Certificate"]
    end

    subgraph DatabaseLayer ["Database Storage Layer (Air-Gapped Single Source of Truth)"]
        DB[("standards.db<br/>(SQLite FTS5 / PostgreSQL 16)")]
        DB --- T_Standards["standards: 19,423 Records"]
        DB --- T_FTS["standards_fts: BM25 Virtual Index"]
        DB --- T_Edges["edges: 14,656 Graph Relationships"]
        DB --- T_QCO["cert_rules: 2,257 Verified QCO Orders"]
    end

    PathA <--> DB
    PathB <--> DB
    PathC <--> DB
    GraphExpander <--> DB
    QCOEngine <--> DB
    VerificationKernel <--> DB
```
</details>

---

### End-to-End Pipeline Execution Matrix

| Stage | Process / Core Technology | Primary Files / Modules | Input $\to$ Output | Latency Profile |
|---|---|---|---|---|
| **1. Ingestion** | PyMuPDF table geometry + PaddleOCR v2.9+ DBNet/SVTR angle-aware recognition | `backend/retrieval/pdf_processor.py`<br/>`backend/retrieval/ocr_processor.py` | Scanned / Digital PDF $\to$ Itemized BoQ Lines | <35 ms (digital)<br/><1.5 s (scanned) |
| **2. Compiler** | Indic Trade Lexicon + Regex Unit Extractor + Archetype Classifier | `backend/retrieval/compiler.py`<br/>`backend/retrieval/multilingual.py` | Raw Query $\to$ Canonical Text + Physical Constraints | <10 ms |
| **3. Retrieval** | 3-Way Parallel Search (Exact ID + FTS5 BM25 + FastEmbed BGE) + RRF ($k=60$) | `backend/retrieval/hybrid_search.py` | Normalized Query $\to$ Top-30 Candidates from 19,423 IS | ~45 ms (cached)<br/>~120 ms (cold) |
| **4. Reranking** | ColBERT Token MaxSim Alignment + Lifecycle Decay + Contradiction Pruning | `backend/retrieval/reranker.py`<br/>`backend/retrieval/constraint_engine.py` | Top-30 Candidates $\to$ Top-N Filtered Standards | ~30 ms |
| **5. Graph** | 14,656-Edge Knowledge Graph Traversal + 6-Facet Completeness Loop | `backend/retrieval/graph_expander.py`<br/>`backend/retrieval/completeness_loop.py` | Primary IS $\to$ Normative Testing & Safety Codes | ~25 ms |
| **6. Regulatory** | DPIIT / Line Ministry Gazette Cross-Reference (2,257 Orders) | `backend/repositories/regulatory_repository.py`<br/>`backend/retrieval/evidence_pack.py` | Applicable IS $\to$ Grounded QCO Mandate & Gazette S.O. | <15 ms |
| **7. Verification** | Mathematical Invariant Check (100% Membership in `standards.db`) | `backend/retrieval/verification_kernel.py` | Generated Clause $\to$ Verified GeM Tender Specification | <5 ms |
| **Total** | **Air-Gapped, Neuro-Symbolic End-to-End Pipeline** | `backend/retrieval/engine.py` | **Raw Specification $\to$ Audit-Ready Compliance Dossier** | **~250 ms (median)** |


### Detailed Component-by-Component Specifications

#### Layer 1: Multimodal Ingestion & Vision Layer
- **Modules:** [`backend/retrieval/pdf_processor.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/pdf_processor.py) & [`backend/retrieval/ocr_processor.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/ocr_processor.py)
- **PyMuPDF Engine (`fitz`):** Extracts text blocks, structured tables, and Schedule of Quantities (BoQ) rows using C-level geometric line intersection (`page.find_tables()`). Latency: $< 35\text{ ms/page}$.
- **PaddleOCR v2.9+ Pipeline:** When pages contain scanned imagery or non-extractable text, MaanakAI renders the page at 150 DPI and passes it to PaddleOCR's DBNet detector and SVTR recognizer.
  - Direction classification (`use_angle_cls=True`) corrects skewed or rotated scans.
  - Heavy 3D unwarping models (`UVDoc`) are bypassed to preserve an ultra-lean CPU inference budget ($< 1.5\text{ s/page}$).
  - Achieves **99.28% average OCR confidence** on real CPWD and DDA tender schedules.

#### Layer 2: Neuro-Symbolic Query Compiler & Entity Guard
- **Module:** [`backend/retrieval/compiler.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/compiler.py) & [`backend/retrieval/multilingual.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/multilingual.py)
- **Deterministic Numerical Extractor:** Extracts physical constraints with regex lookaheads for units:
  $$\text{Units} \in \{\text{mm}, \text{cm}, \text{m}, \text{kV}, \text{V}, \text{kW}, \text{HP}, \text{MW}, \text{Hz}, \text{MPa}, \text{IP ratings}\}$$
  and material grades ($\text{Fe 500D}, \text{Fe 415}, \text{M25}, \text{Grade 43}, \text{304 Stainless}$).
- **Multilingual Trade Lexicon & Entity Guard:** Translates colloquial Indian market trade names into official BIS terminology (e.g., Hinglish *"12mm sariya"* $\to$ *"12mm high strength deformed steel rebar"*, Marathi *"लोखंडी गज"* $\to$ *"steel reinforcement bars"*, Tamil *"சிமெண்ட்"* $\to$ *"ordinary portland cement"*). Crucially, the **Entity Guard** shields all numerical and grade tokens so they are never garbled by language conversion.
- **Procurement Archetype Classifier:** Categorizes line items into:
  - `MATERIAL_PROCUREMENT`: Physical engineering supply (triggers standards search).
  - `SERVICE_LABOR`: Pure manual labor/survey work.
  - `DEMOLITION_DISPOSAL`: Dismantling existing structures (references safety code IS 4130).
  - `SALVAGE_CREDIT`: Deduction for contractor salvage value of dismantled scrap (suppresses false procurement constraints).

#### Layer 3: Parallel Hybrid Retrieval & Reciprocal Rank Fusion
- **Module:** [`backend/retrieval/hybrid_search.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/hybrid_search.py)
- **Three Search Channels Executed Concurrently:**
  1. **Path A (Exact Standard Lookup):** O(1) index lookup if user mentions an explicit standard (e.g., *"IS 1786:2008"* or *"IS 1239 Part 1"*).
  2. **Path B (Multi-Tier SQLite FTS5 BM25):** Full-text lexical search ranking exact phrases first, then conjunctive Boolean `AND`, followed by BM25 scoring.
  3. **Path C (Dense Semantic Vector Search):** 384-dimensional dense vectors generated via `bge-small-en-v1.5` running locally on CPU via ONNX Runtime (`fastembed`). Vector embeddings are cached in an in-memory LRU cache (0 ms repeat latency).
- **Reciprocal Rank Fusion (RRF):** Fuses rankings using calibrated channel weights:
  $$\text{RRF}(d) = \frac{3.5}{60 + \text{rank}_{\text{Exact}}(d)} + \frac{1.5}{60 + \text{rank}_{\text{Dense}}(d)} + \frac{1.2}{60 + \text{rank}_{\text{Lexical}}(d)}$$

#### Layer 4: ColBERT Late-Interaction Re-ranking & Constraint Engine
- **Modules:** [`backend/retrieval/reranker.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/reranker.py) & [`backend/retrieval/constraint_engine.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/constraint_engine.py)
- **Token-Level MaxSim Reranking:** Computes granular token alignment between query tokens $Q$ and candidate title/scope tokens $D$:
  $$\text{MaxSim}(Q, D) = \frac{1}{|Q|} \sum_{q \in Q} \max_{d \in D} \left( \frac{q \cdot d}{\|q\| \|d\|} \right)$$
- **Life-Cycle Scoring Penalties:** Actively prioritizes current standards over outdated ones (`CURRENT`: $1.0\times$, `SUPERSEDED`: $0.75\times$, `WITHDRAWN`: $0.40\times$).
- **Contradiction & Negative Evidence Pruning:** Evaluates engineering invariants (e.g., if query specifies *"outdoor submersible installation"* and candidate standard is restricted to *"indoor dry conditions"*, the candidate is instantly pruned).

#### Layer 5: Knowledge Graph Expansion & Completeness Loop
- **Modules:** [`backend/retrieval/graph_expander.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/graph_expander.py) & [`backend/retrieval/completeness_loop.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/completeness_loop.py)
- **14,656-Edge Knowledge Graph:** Traverses directed relationships:
  - `TESTED_BY` $\to$ Acceptance testing protocols (e.g., IS 1608 for rebar tensile testing).
  - `CITED_IN` $\to$ Higher-level design codes (e.g., IS 456 for structural concrete).
  - `SAFETY_CODE` $\to$ Worker and equipment safety standards.
  - `SUPERSEDED_BY` $\to$ Automatic redirection to active editions (e.g., IS 8112 $\to$ IS 269).
- **6-Facet Completeness Auditor:** Assesses whether a tender specification covers all mandatory procurement dimensions:
  $$\text{Facets} = \{\text{Product}, \text{Material/Grade}, \text{Dimensions}, \text{Acceptance Testing}, \text{Safety}, \text{Regulatory Mandate}\}$$
  If a facet is missing, the engine executes targeted micro-retrieval to supply the missing allied standard.

#### Layer 6: Grounded Regulatory Intelligence (QCO Engine)
- **Modules:** [`backend/repositories/regulatory_repository.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/repositories/regulatory_repository.py) & [`backend/data_pipeline/enrich_qco_evidence.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/data_pipeline/enrich_qco_evidence.py)
- **Eliminates False Assumptions:** Does not guess regulatory status based on standard existence.
- **Gazette-Verified Mapping:** Direct SQL matching against **2,257 Gazette notifications** across line ministries (Ministry of Steel, DPIIT, MeitY, MoHUA, Ministry of Heavy Industries).
- **Safety Fallback:** If no official Gazette notification exists for the exact product/IS pair, the engine returns `NOT_VERIFIED` with full explanatory rationale, ensuring procurement officials are never misinformed.

#### Layer 7: Zero-Hallucination Verification Kernel & Clause Generator
- **Module:** [`backend/retrieval/verification_kernel.py`](file:///c:/Users/Pushkar%20Shelar/Desktop/SIH%2026108/backend/retrieval/verification_kernel.py)
- **Strict Invariant Guard:** Every cited IS number generated in any output clause is extracted via regex and verified against the canonical index of 19,423 standards in `standards.db`.
- **Automatic Sanitation:** Non-existent standard numbers are stripped 100% and logged in an automated compliance audit trail.
- **5-Point Model Tender Specification Clause:** Produces a standardized, GeM/CPPP-compliant tender clause covering:
  1. Primary Governing Product Standard & Edition
  2. Compulsory Regulatory Certification & QCO Order Reference
  3. Factory Acceptance Testing & Quality Assurance Sampling (Allied IS)
  4. Worksite Storage, Handling & Safety Protocols
  5. Marking, Inspection, and CM/L License Verification Protocols


---

## 4. Validated Evaluation & Benchmark Results

All evaluation benchmarks are verifiable via reproducibility scripts included in the repository.

### Gold Benchmark (75 Test Cases across 9 Engineering Divisions)
*Evaluated using `backend/eval/benchmark.py` against `backend/eval/gold_dataset.json`:*

| Benchmark Metric | Target Standard | MaanakAI Result | Status |
|---|---|---|---|
| **Top-1 Primary Standard Accuracy** | $\ge 80.0\%$ | **91.7%** |  PASSED (+11.7%) |
| **Top-3 Recommendation Recall** | $\ge 90.0\%$ | **100.0%** |  PASSED (Perfect) |
| **Top-5 Recommendation Recall** | $\ge 95.0\%$ | **100.0%** |  PASSED (Perfect) |
| **Mean Reciprocal Rank (MRR)** | $\ge 0.850$ | **0.9556** |  PASSED |
| **Zero-Hallucination Guarantee** | $100.0\%$ | **100.0%** |  PASSED (Zero Invented Codes) |
| **Compulsory QCO Detection** | $\ge 85.0\%$ | **89.5%** |  PASSED |
| **Unit Test Coverage** | $100\%$ passing | **17 / 17 passed** |  PASSED |

### Real-World 165-Page DDA Tender BoQ Audit
*Evaluated on authentic Delhi Development Authority Tender (`NIT No. 05/EE(P)/SE(SCC-3)/DDA/2026-27`):*
- **Items Audited:** 23 line items (Excavation, RCC M25, TMT Rebar, Flush Doors, GI Pipes, Sanitaryware, Wiring, MCBs, ABC Fire Extinguishers).
- **Primary Standard Accuracy:** **91.3% (21 / 23 items matched)**.
- **Top-3 Recommendation Recall:** **100.0% (23 / 23 items)**.
- **Mandatory QCOs Enforced:** 8 critical orders detected (preventing substandard steel, pipes, wiring, and fixtures from entering public works).
- **Salvage / Credit Disambiguation:** 100% precision in distinguishing demolition credit lines from material procurement.

*Detailed evaluation reports are archived in the **[`reports/`](reports/)** directory.*

---

## 5. Repository Organization

```
SIH 26108/
├── README.md                             # Project documentation & overview
├── HOW_TO_RUN.md                         # Detailed step-by-step startup guide
├── ARCHITECTURE.md                       # Architectural deep-dive & schemas
├── .gitignore                            # Strict security rules (No DBs, No GGUF, No keys)
│
├── backend/                              # FastAPI Python Backend
│   ├── api_service.py                    # REST API Endpoints & FastAPI application
│   ├── config.py                         # Application configuration
│   ├── requirements.txt                  # Python dependencies
│   │
│   ├── retrieval/                        # Core Retrieval & Intelligence Modules
│   │   ├── engine.py                     # 5-stage StandardsRecommenderEngine coordinator
│   │   ├── hybrid_search.py              # FTS5 + Dense Vector + Exact matching + RRF
│   │   ├── constraint_engine.py          # Physical dimension & material extraction
│   │   ├── graph_expander.py             # Normative & allied standard relationship expansion
│   │   ├── evidence_pack.py              # Gazette QCO compliance grounding
│   │   ├── verification_kernel.py        # Zero-hallucination mathematical verification
│   │   ├── ocr_processor.py              # PaddleOCR multilingual document extractor
│   │   ├── pdf_processor.py              # PyMuPDF BoQ layout & table parser
│   │   ├── multilingual.py               # Indic vernacular translator & Entity Guard
│   │   └── product_classifier.py         # Product category & division inference
│   │
│   ├── repositories/                     # Data access & database layers
│   │   └── regulatory_repository.py      # QCO Gazette & certification lookups
│   │
│   ├── data_pipeline/                    # Pipeline utilities & enrichment scripts
│   │   ├── enrich_qco_evidence.py        # Gazette notification & ministry link enrichment
│   │   └── load_database.py              # SQLite FTS5 schema & database builder
│   │
│   ├── tests/                            # Unit & Integration Tests (17 tests, 100% pass)
│   │   ├── test_api.py                   # API & Verification Kernel tests
│   │   ├── test_new_apis.py              # Specification & Tender health tests
│   │   └── test_new_endpoints.py         # Dashboard & Basket mutation tests
│   │
│   └── eval/                             # Evaluation & Benchmarking Suites
│       ├── benchmark.py                  # 75-query Gold Dataset benchmark runner
│       ├── gold_dataset.json             # 75 curated multi-domain ground truth test cases
│       ├── test_dda_tender.py            # Real-world 165-page DDA Tender BoQ test suite
│       ├── test_paddle_ocr.py            # PaddleOCR integration & confidence test
│       └── test_real_world_tenders.py    # Multi-agency (NHAI, CPWD, Discom, GeM) suite
│
├── frontend/                             # React 18 + TypeScript + Vite UI
│   ├── src/
│   │   ├── features/                     # Core application modules
│   │   │   ├── dashboard/                # Analytics & procurement metrics
│   │   │   ├── standards/                # Standards Discovery & Detail view
│   │   │   ├── review/                   # Upload Tender BoQ & Compliance Matrix
│   │   │   ├── specification/            # Grounded Specification Clause Builder
│   │   │   ├── tender-health/            # Contradiction & Ambiguity Auditor
│   │   │   ├── graph/                    # Standards Knowledge Graph Explorer
│   │   │   └── export/                   # Model GeM Tender Clause Exporter
│   │   └── services/api.ts               # Axios client connected to backend (:8000)
│   └── package.json                      # Frontend dependencies
│
├── reports/                              # Consolidated Benchmark & Audit Reports
│   ├── README.md                         # Reports index & reproduction commands
│   ├── gold_benchmark_report.md          # 75-Query benchmark metrics & analysis
│   ├── dda_tender_audit_report.md        # Full DDA 165-page Tender BoQ compliance audit
│   └── paddle_ocr_validation_report.md   # PaddleOCR extraction accuracy report
│
├── test_interactive.py                   # Judge / Evaluator CLI interactive tester
├── test_pdf.py                           # CLI PDF tender auditor
└── test_quick.py                         # 3-second instant self-test script
```

---

## 6. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.11 & 3.13)
- Node.js 18+ & npm
- Standard dual-core or quad-core CPU (No dedicated GPU required)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Pushkar-Shelar/SIH26108-MaanakAI.git
cd SIH26108-MaanakAI
```

### Step 2: Set Up Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Launch Backend Server
```bash
# From the backend directory:
python -m uvicorn api_service:app --host 127.0.0.1 --port 8000 --reload
```
*Backend Swagger API Documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### Step 4: Set Up & Launch Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend Procurement Intelligence UI is live at: [http://127.0.0.1:5173](http://127.0.0.1:5173)*

---

## 7. Instant CLI Verification (Zero Setup)

You can run self-testing scripts directly from the workspace root:

### Quick 3-Second Verification
```bash
python test_quick.py
```
*Runs instant tests across English, Hindi Devanagari, Marathi trade slang, and electrical equipment.*

### Interactive Query & PDF Auditor
```bash
python test_interactive.py
```
*Interactive terminal interface to input custom tender specifications or run live PDF extraction.*

### Run Complete Unit Test Suite
```bash
cd backend
python -m pytest tests/ -v
```
*(17 tests validating API health, Query Compiler, Verification Kernel, Specification Generator, and Basket mutations).*

---

## 8. Team & Acknowledgements

- **Developed for:** Smart India Hackathon (SIH) 2024 / 2026
- **Theme:** Smart Automation / Public Procurement Intelligence
- **Nodal Ministry:** Ministry of Consumer Affairs, Food & Public Distribution
- **Knowledge Partner:** Bureau of Indian Standards (BIS)

---
*MaanakAI — Driving Zero-Defect, Standards-Compliant Public Procurement across India.*
