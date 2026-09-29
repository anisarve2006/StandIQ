# Indian Standards Recommendation Engine — Architecture & Build Specification (v3)

**Audience:** an AI coding agent that will build this project end to end. Read Sections 0–5 fully before writing code.
**Status of this document:** v3 replaces v1/v2. v3 was rewritten from the *actual problem statement* (Section 1), not from competitor critiques, and every external factual claim is labelled **VERIFIED** (checked against a live source, with URL and date) or **UNVERIFIED** (must be checked by you at build time). Nothing marked UNVERIFIED may be presented as fact in the README, UI, or pitch.

---

## 0. Operating rules for the agent (binding)

1. **Never fabricate data.** No invented Indian Standards, clauses, IS numbers, QCOs, gazette references, tenders, or test results anywhere in the corpus, fixtures shown in the UI, or the demo path. Synthetic data is allowed **only** for (a) unit-test inputs of parsers (clearly named `test_*`), and (b) paraphrased *query text* in the evaluation set (Section 15). If real data cannot be obtained, stop that task, write the reason in `docs/blockers.md`, continue with other work, and tell the human. Do not substitute mock data.
2. **Verify before you rely.** Every item in Section 4 marked UNVERIFIED is your first job in Phase 0 (the "source reality check"). Record findings with dates in `docs/sources.md`. Where reality differs from this document, reality wins; amend this document in a PR.
3. **Code decides facts; the LLM only explains.** IS numbers, editions, status, certification status, graph edges, numbers and units are produced by deterministic code from the database. The LLM never has retrieval tools and never writes those fields (Section 10).
4. **Abstain over assert.** A wrong "this standard applies" is worse than "verify this". Every recommendation carries an evidence tier and a calibrated confidence label.
5. **Postgres is the single source of truth.** Qdrant and any cache are rebuildable projections. You must be able to drop and rebuild them from Postgres + stored source documents alone.
6. **Human-only steps.** You cannot do these; ask the human early and keep working meanwhile: creating accounts / passing captchas / accepting terms on BIS portals; supplying API keys; downloading licensed PDFs; confirming licence/redistribution terms; providing real tenders if public download is not possible.
7. **Git discipline** (Section 17): small conventional commits, one branch and PR per phase item, no binaries/logs/notebooks/agent-scaffolding files committed.
8. **Build depth-first.** A narrow, fully real, working slice at the end of every phase. If time runs short, cut from the bottom of the phase list (Section 18), never the top.

---

## 1. Problem statement (source of truth, verbatim scope)

**Title:** AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications.

Procurement officials must reference correct Indian Standards (IS) in tender specifications, but identification is hard because of the number of standards, overlapping scopes, frequent revisions and normative cross-references. Tenders therefore omit relevant standards, cite outdated versions, or contain incomplete requirements.

**Required:** an AI-powered recommendation engine that **integrates with procurement portals** and helps officials identify the most relevant Indian Standards and related standards while preparing tender specifications.

**Expected features (each mapped to a component):**

| # | Feature in problem statement | Component (section) |
|---|---|---|
| F1 | Accept product descriptions, technical specifications, or tender documents | Query API §9, Tender pipeline §8 |
| F2 | Recommend most relevant IS based on semantic understanding, not keyword matching | Retrieval §7 |
| F3 | Identify allied standards: normative references, test methods, terminology, safety, installation, related product standards | Allied-standards graph §11 |
| F4 | Highlight latest published version and amendments | Version engine §12 |
| F5 | Suggest mandatory certification where applicable (BIS Product Certification, CRS, Hallmarking) | Certification registry §13 |
| F6 | Multilingual input and natural-language queries | Multilingual handling §7.1, UI §14 |
| F7 | Integrates with procurement portals | Integration layer §9.3, §14.3 |

**Explicit non-requirements (do not build unless time remains):** the problem statement does **not** require air-gapped/on-premise deployment, data-residency guarantees, role-based access control, a graph database, or any specific model/vendor. Earlier drafts treated these as requirements because of third-party critiques; they are not. They appear here only as optional profiles (Section 18, Phase 4).

---

## 2. Goals, non-goals, success criteria

**Goals:** (1) correct, evidence-backed recommendations for real products; (2) allied standards, version status and certification flags that are traceable to a real source and date; (3) honest handling of uncertainty and partial coverage; (4) usable by a procurement officer in English and Hindi at minimum; (5) embeddable in a portal.

**Non-goals:** legal advice; replacing BIS's catalogue; certifying that a tender is compliant; scraping anything that the source's terms forbid.

**Success criteria (measured, not asserted):** Recall@5 on the gold set (Section 15); abstention precision on asserted recommendations; kernel strip rate (hallucination proxy); per-language recall parity; measured p50/p95 latency; coverage report showing real tier counts.

---

## 3. Key design decisions (resolved — do not re-ask the human)

| Decision | Choice | Rationale / notes |
|---|---|---|
| LLM access | **Provider-agnostic `LLMClient` interface**; providers: `anthropic` (default), `openai_compatible` (covers local vLLM/Ollama or any compatible endpoint), `none` (deterministic fallback) | Problem statement has no cloud restriction. Hosted default removes GPU setup risk; switching provider is a config change. |
| Default hosted models | `claude-sonnet-5` for reasoning tasks, `claude-haiku-4-5-20251001` for cheap extraction. **Confirm current IDs in Anthropic docs at build time.** | Model IDs come from Anthropic product info at time of writing. |
| Structured output | Ask for JSON, **always validate locally with Pydantic**, retry once, then fall back deterministically. Never rely on provider-side schema enforcement. | Provider-independent; avoids unverified feature assumptions. |
| Embeddings | `BAAI/bge-m3` run **locally** (dense + sparse in one pass) | Native multilingual; no per-query API cost. Confirm licence and output dims from the model card at build time. |
| Reranker | `BAAI/bge-reranker-v2-m3` run locally (cross-encoder) | Same family, multilingual. CPU fallback: rerank fewer candidates. |
| Vector store | Qdrant, dense + sparse named vectors, server-side RRF fusion | ANN (HNSW) index; supports filtered search. Confirm the hybrid/fusion query API against the installed version's docs. |
| System of record | PostgreSQL 16 (+`pg_trgm`) | Single source of truth. |
| Graph | Allied-standards graph stored as rows in Postgres `edges`; traversal via recursive CTE, depth ≤ 2. **Neo4j is an optional Phase-4 projection**, not required. | At ~22.7k nodes and depth ≤ 2, Postgres is sufficient. |
| Async | Celery + Redis; job state durable in Postgres | Ingestion and tender jobs must survive restarts. |
| Blob storage | Local volume by default behind a `BlobStore` interface; S3-compatible (MinIO) optional | Fewer moving parts. |
| PDF parsing | Docling primary, PyMuPDF for born-digital text/geometry, Tesseract (eng+hin) then optional VLM fallback for poor pages | Confirm each tool installs in the container; benchmark on real pages. |
| Backend | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2 + Alembic, Gunicorn+Uvicorn workers | |
| Frontend | Next.js (App Router) + TypeScript + Tailwind + `next-intl` | |
| Auth | Phase 1–2: none (demo) + API keys for portal integration. Phase 3: lightweight JWT roles (`officer`, `admin`) | Keycloak is out of scope. |
| Deployment | Docker Compose (multi-service), `.env`-driven, no dev servers in the demo compose file | |

---

## 4. Verified facts and open unknowns about data sources

Verified on **25 Sep 2026** by search/fetch during spec writing. Source URLs are given so you can re-check.

### 4.1 VERIFIED

| ID | Fact | Source |
|---|---|---|
| V1 | BIS "Know Your Standard" (KYS) exists. Users search by IS number or keyword; per standard it exposes the IS PDF, amendments, gazette notifications, scheme of testing and inspection, list of licences, list of laboratories testing that IS, classification details and technical-committee composition. The interactive app is at `https://standards.bis.gov.in/website/know-your-standards`. | `https://www.bis.gov.in/know-your-standard/?lang=en` (page last updated 8 May 2026) |
| V2 | The KYS app is a JavaScript single-page app: a plain HTTP fetch returned only a page shell with no data. You must inspect its network calls or use browser automation to find a data source, **after** checking terms (U2). | fetch of the URL above, 25 Sep 2026 |
| V3 | Other BIS listing pages exist: Published Standards (department-wise) `https://standards.bis.gov.in/website/published-standards/department-wise`; New Standards and Revised Standards pages under `services.bis.gov.in/php/BIS_2.0/dgdashboard/Published_Standards_new/`; "Download Indian Standards" links to a third-party host `https://standardsbis.bsbedge.com/`; IS-wise test-facility lookup at `https://lims.bis.gov.in/home/search_is_number/`. | Menu of the KYS page |
| V4 | `manakonline.in` is BIS's **certification/licensing** portal (e.g. FMCS online applications, hallmarking HUID lists). It was **not** found to be a standards catalogue. An earlier draft's claim that post-Oct-2025 standards moved to manakonline.in is **unsupported — do not implement it.** | `https://www.manakonline.in/MANAK/login`; ChemLinked, 18 May 2026 |
| V5 | Scale: a Government press release (Mar 2025) states about 23,000 Indian Standards are in force (22,689 in force in one passage), 187 Quality Control Orders covering 769 products have been notified, 10,300 IS have ISO/IEC counterparts and 9,616 of those are harmonized. Treat **~22.7k** as the catalogue-size order of magnitude; measure the real number. | PIB release `https://www.pib.gov.in/PressReleasePage.aspx?PRID=2110935` |
| V6 | BIS certification is voluntary by default; for many products the Central Government makes it compulsory through **Quality Control Orders (QCOs)**, directing use of the Standard Mark under a BIS Licence or Certificate of Conformity. BIS publishes a "Products under Compulsory Certification" page. | `https://www.bis.gov.in/product-certification/products-under-compulsory-certification/?lang=en` |
| V7 | QCOs are published as PDFs on `egazette.gov.in` (pattern `egazette.gov.in/WriteReadData/<year>/<id>.pdf`), issued by line ministries (e.g. Ministry of Commerce and Industry) — **not** by a BIS department. They contain a table of goods with applicable IS and a clause that the latest version of the Indian Standards including amendments notified by BIS applies. Example real titles: "Electric Ceiling Type Fans (Quality Control) Order, 2023"; "Safety of Household, Commercial and Similar Electrical Appliances (Quality Control) Order, 2024". | egazette PDFs surfaced in search, 25 Sep 2026 |
| V8 | QCO/gazette PDFs are bilingual (Hindi + English). In search-result extraction the Hindi text appeared garbled (legacy font encoding), so **treat Hindi text extracted from gazette PDFs as unreliable and parse the English part.** | Same egazette PDFs |
| V9 | BIS has an e-Gazette notification page and hosts mandatory-hallmarking orders/amendments (gazette PDFs) on its site. Hallmarking orders are dated and amended repeatedly (latest seen: 3 Aug 2026; regulations amendment 14 Sep 2026) — hallmarking rules are **time-varying**, so model them with dates. | KYS page menu, Hallmarking section |
| V10 | Standard-number format seen in real BIS listings: `IS 17440 : 2020`, `IS 6307 : 2023`, and in product lists `IS 13252(Part 1):2010`, `IS 302-2-26:2014` (some with trailing `*`; meaning of `*` is UNVERIFIED — preserve it in `raw`). Use these as test vectors for the ID normalizer. | BIS homepage; product list snippet |
| V11 | Compulsory schemes named in secondary sources: ISI Mark (Scheme I) and Compulsory Registration Scheme (CRS, Scheme II); BIS menu also lists "Scheme-X" and CRS at `crsbis.in`. (Secondary source for the I/II numbering — confirm on BIS pages.) | BIS menu; ChemRadar |

### 4.2 UNVERIFIED — resolve in Phase 0 (source reality check)

| ID | Unknown | How to resolve |
|---|---|---|
| U1 | Whether KYS/catalogue data include **"referred-to / referring" standards lists**, degree-of-equivalence with ISO/IEC, reaffirmation year, amendment counts, bilingual titles, scope text | Inspect the KYS app's network calls / DOM for a few standards; record which fields exist in `docs/sources.md`. Only build extractors for fields that exist. |
| U2 | Terms of use, `robots.txt`, rate limits and permitted automated access for `standards.bis.gov.in`, `services.bis.gov.in`, `egazette.gov.in`; BIS copyright page (`https://bis.gov.in/PDF/lab/copyright.pdf`) — automated fetch was blocked, **a human must read it** | Human reads; agent records conclusion. If automated access is not allowed, ask human for an export or use manual entry within permitted terms. |
| U3 | How full-text IS PDFs are obtained (login/captcha/terms) and whether bulk indexing/redistribution is allowed | Human. Keep PDFs private; never publish or commit them. |
| U4 | Whether the SIH organizers provided a dataset/API | Human checks the official problem-statement page. Prefer it over scraping if it exists. |
| U5 | Whether real tender documents (GeM / CPPP `eprocure.gov.in`) are downloadable without login | Human/agent test; if not, human supplies real tenders. Never write fake tenders. |
| U6 | Whether a BIS list of QCO-covered products with IS numbers can be machine-read (BIS page or QCO PDFs) | Inspect BIS "Products under Compulsory Certification" page and 5+ QCO PDFs; document table layouts. |
| U7 | Exact hybrid-query API of the installed Qdrant version; BGE-M3 sparse-vector output format in the chosen library (e.g. FlagEmbedding) | Read installed-version docs; write an integration test. |
| U8 | Availability of GPU on demo hardware | Human. Design works on CPU; measure. |

**Coverage tiers (used everywhere):**
- **Tier A — catalogue:** metadata for as many real standards as can be legitimately obtained (target: the full in-force catalogue, ~22.7k per V5).
- **Tier B — full text:** real PDFs for a curated subset supplied/obtained under permitted terms (target 150–300 standards across 2–3 domains, chosen with the human; suggested domains: electrical equipment, structural/reinforcement steel, cement — confirm they have QCOs, and that PDFs are obtainable).
- **Tier C — real tenders:** real public tender documents for the linter's fixtures.
- **Tier D — regulatory:** real QCO / gazette PDFs and BIS compulsory-certification listings.

Every recommendation carries an **evidence tier**: `CLAUSE_EVIDENCE` (backed by clause text with page/bbox), `CATALOGUE_EVIDENCE` (title/scope/metadata only), or `UNVERIFIED`. A **coverage report** page/API publishes the real counts per tier and domain. This is a feature: it stops partial coverage from looking like failure.

---

## 5. System overview

```
                          ┌────────────────────────── DATA PLANE (offline / async) ──────────────────────────┐
 Source registry          │                                                                                  │
 (url, date, sha256,  ── │ Adapters: KYS catalogue │ curated IS PDFs │ QCO/gazette PDFs │ real tenders     │
  licence note)           │        │                                                                         │
                          │  Parse (Docling → PyMuPDF → OCR → optional VLM) + page-quality score            │
                          │        │                                                                         │
                          │  Structure (clause tree, tables, figures) → contextual chunks                    │
                          │        │                                                                         │
                          │  Extract: IDs, references, amendments, cert rules (deterministic-first)          │
                          │                                                                                 │
                          │  POSTGRES (truth) ── Qdrant [cards, clauses]   ── (optional) Neo4j             │
                          └──────────────────────────────────────────────────────────────────────────────────┘

                          ┌────────────────────────── SERVING PLANE (online) ────────────────────────────────┐
 Portal widget / Web UI ─│ FastAPI gateway (API keys, rate limit, i18n) ──┬─ short query (sync, fast path)  │
 REST clients ───────────│                                                 └─ tender/doc (async Celery job)  │
                          │                                                                                  │
                          │ Query understanding ─ RequirementSpec ─ Router                                 │
                          │   ─ Card recall (dense+sparse+trigram) ─ Clause retrieval (filtered)           │
                          │   ─ RRF ─ cross-encoder rerank ─ standard-level aggregation                   │
                          │   ─ Applicability (SATISFIES/VIOLATES/UNKNOWN) ─ Allied graph ─ Version       │
                          │   ─ Certification ─ Completeness ─ Scoring/abstention                         │
                          │   ─ Evidence pack ─ LLM rationale (optional) ─ VERIFICATION KERNEL            │
                          │   ─ Response (structured first, rationale streams after) ─ UI / API / export   │
                          └──────────────────────────────────────────────────────────────────────────────────┘
```

**Services in `docker-compose.yml`:** `postgres`, `qdrant`, `redis`, `api` (FastAPI/Gunicorn), `worker` (Celery), `web` (Next.js `next start`), optional `minio`, optional `ollama`/`vllm` (only for the local-LLM profile), optional `neo4j` (Phase 4). Model weights are downloaded into a named volume at first run (never committed).

---

## 6. Configuration (`.env.example`; every value overridable)

| Variable | Default | Meaning |
|---|---|---|
| `LLM_PROVIDER` | `anthropic` | `anthropic` \| `openai_compatible` \| `none` |
| `LLM_API_KEY` | (empty) | Provider key; required for hosted providers |
| `LLM_BASE_URL` | (empty) | For `openai_compatible` (local server or other vendor) |
| `LLM_MODEL_REASON` | `claude-sonnet-5` | Rationale/complex extraction |
| `LLM_MODEL_FAST` | `claude-haiku-4-5-20251001` | Cheap extraction tasks |
| `LLM_TIMEOUT_S` / `LLM_MAX_RETRIES` | `30` / `1` | |
| `EMBED_MODEL` | `BAAI/bge-m3` | Local |
| `RERANK_MODEL` | `BAAI/bge-reranker-v2-m3` | Local |
| `RERANK_TOP_N` | `48` (GPU) / `24` (CPU) | Tune by measurement |
| `RRF_K` | `60` | Standard RRF constant |
| `AS_OF_DEFAULT` | today | Date for status/certification evaluation |
| `BLOB_BACKEND` | `local` | `local` \| `s3` |
| `FEATURE_VLM_CAPTIONS` | `false` | Needs an image-capable provider |
| `FEATURE_NEO4J` | `false` | Phase 4 |
| `FEATURE_AUTH` | `false` | Phase 3 JWT roles |
| `SOURCE_RATE_LIMIT_RPS` | `0.5` | Politeness limit for any adapter |

**Data-flow note (must appear in README):** with `LLM_PROVIDER=anthropic` (default), query text and selected tender excerpts are sent to the provider; PDFs and the corpus are not. Set `openai_compatible` with a local endpoint or `none` to avoid this. Embeddings and reranking always run locally.

---

## 7. Query understanding and retrieval (serving plane, fast path)

*Data model is in Appendix A. Ingestion pipeline and the canonical ID normalizer are in Appendix B. Build those first.*

### 7.1 Query understanding and multilingual handling (F1, F6)

Input: free text (any supported language), optional `as_of_date`, optional `lang` hint, optional structured hints (`hs_code`, `portal_category`).

1. **Normalize:** Unicode NFC; Devanagari (and other Indic) digits → ASCII digits; collapse whitespace; detect language/script (any maintained detector library; record result and confidence). Standard IDs, units, clause numbers and grade tokens (`IP65`, `Fe 500D`, `Grade 304`) are **protected tokens** — never translated or altered.
2. **Deterministic parse (owns all numbers):** extract IS IDs (via the Appendix-B normalizer), quantities with units (`415 V ± 10%`, `50 Hz`, `2.5 mm²`), ranges, IP ratings, dates. Use a unit library (e.g. `pint`) with property-based tests.
3. **LLM extraction (optional, `LLM_MODEL_FAST`):** returns JSON `RequirementSpec` — `{product, application, environment, attributes:[{name, op, value, unit, source_span}], intent}`. **Validation rule:** every numeric `value` and its `source_span` must occur in the normalized input; any attribute failing this is dropped. On conflict the deterministic parser wins. With `LLM_PROVIDER=none`, the spec is built from the deterministic parse plus the raw text only.
4. **Embedding:** BGE-M3 embeds the query natively in its own language (dense + sparse). Do **not** translate-then-embed. An optional English rendering of the query (produced by the LLM) may be added as a *second* query variant and fused via RRF — never as a replacement, and off by default.
5. **Clarification (deterministic, no LLM):** if the top candidates differ on an attribute the query does not specify, compute which attribute best splits them and return up to two structured clarifying questions with tap options.

### 7.2 Router

Deterministic rules (no LLM): exact IS ID → Postgres exact + `pg_trgm` and done; "what references / referenced by X" → graph-first; table/figure lookup → clause index including table-row and figure-caption chunks; concept/product → card recall then clause retrieval; whole document → tender pipeline (Section 8).

### 7.3 Stages

1. **Card recall.** Qdrant `cards` collection (one point per standard: title, scope, aspect, classification text, both languages when available). Dense + sparse, RRF fusion, plus `pg_trgm` on titles for spelling variants. Optional filter by predicted domain/classification. Return top 100.
2. **Clause retrieval.** Qdrant `clauses` collection (Tier B only), filtered by the card-recall `family_id` set. Dense + sparse + exact-token match for alphanumeric constraints. Exact alphanumerics must go through sparse/exact paths, not dense alone.
3. **Fusion:** RRF (`RRF_K`) over card and clause results.
4. **Rerank:** cross-encoder over top `RERANK_TOP_N` (query vs. clause/card text).
5. **Standard-level aggregation:** the answer is per standard, not per chunk. Score a standard from: best clause score, decayed sum of its top-k clauses, scope-clause boost, card score. Standards with only catalogue data are scored from the card and labelled `CATALOGUE_EVIDENCE`.
6. **Applicability (Phase 3, Section 7.4).**
7. **Graph expansion** (Section 11), **version** (Section 12), **certification** (Section 13), **completeness check** (below), **scoring and abstention** (Section 10.4).

**Completeness check:** each product class (from classification/ICS grouping) gets an *allied checklist* derived from the graph and co-citation statistics in Tier B text (roles: test method, terminology, safety, installation, material, related product). The response lists checklist roles with no matching standard as **gaps** ("no installation standard identified — verify"). Do not invent checklists; derive them and mark statistical ones as `INFERRED`.

### 7.4 Applicability engine (Phase 3)

For each candidate with Tier B text, compare requirement attributes with constraints extracted from its clauses. Outcomes are **three-valued**: `SATISFIES`, `VIOLATES`, `UNKNOWN`. `UNKNOWN` never removes a candidate — it lowers confidence and produces a "verify X" gap. Constraints are extracted deterministically from tables/clauses where possible, otherwise by LLM **and** verified against the source span; unverifiable constraints are stored as `UNKNOWN`, never guessed. Scope **exclusions** ("this standard does not apply to …") are extracted as first-class rows; a match demotes the candidate into a "Considered and excluded" list with the reason and clause citation.

---

## 8. Tender / document pipeline (F1, F3, F4) — async Celery job

1. **Parse** the upload (PDF/DOCX/TXT) with the Appendix-B parser; classify sections (technical specification vs. commercial/legal/eligibility) using headings + LLM fallback; skip boilerplate.
2. **Line items:** detect BoQ/item tables; map rows to items with quantity/unit. If no table is found, treat technical-specification paragraphs as a single item and say so in the report.
3. **Per-item requirement objects** → run the Section-7 pipeline as a parallel Celery group with a shared cache. Cap by page and item count (configurable) and report progress over SSE.
4. **Citation extraction (layered):** L1 tolerant regex over normalized text (handles `IS:1239`, `I.S. 1239`, `IS-1239 Pt 1`, `IS 13252(Part 1):2010`, OCR confusions like O↔0 in numeric context, Devanagari digits); L2 fuzzy match unresolved strings against the catalogue ID dictionary; L3 LLM span proposer over paragraphs that mention a standard but yielded no ID; L4 **every candidate verified against the catalogue** — the LLM only proposes; unverified strings become `UNVERIFIED_CITATION` findings.
5. **Lint findings** (each with as-of date and source): `OK_CURRENT`, `STALE_EDITION`, `SUPERSEDED`, `WITHDRAWN`, `NOT_FOUND` (with nearest-ID suggestion), `WRONG_PART`, `SCOPE_MISMATCH`, `AMENDMENT_NOT_REFERENCED`, `CERT_REQUIREMENT_MISSING`, `MISSING_ALLIED`, plus cross-item conflicts. Only emit a finding class when the required data exists (e.g. do not emit `SUPERSEDED` if status data for that standard is `UNKNOWN`; emit `STATUS_UNKNOWN` instead).
6. **International equivalents:** if the tender cites IEC/ISO/ASTM/BS/DIN, and the catalogue contains an equivalence field (U1), suggest the Indian counterpart; otherwise skip silently.
7. **Output:** item × standard × role × status matrix, missing-standard suggestions, lint findings, exports (Section 14).

Test only against **real** tenders (Tier C). If none are available, block and ask the human (U5).

---

## 9. API (FastAPI, versioned `/v1`, OpenAPI auto-generated)

### 9.1 Endpoints

```
POST /v1/query                       { text, lang?, as_of_date?, hints? }
   → { request_id, as_of_date, language, requirement_spec, results[], gaps[], excluded[],
       clarifications[], coverage_note, degraded: {llm: bool, reranker: bool} }
GET  /v1/query/{request_id}/rationale      SSE stream of kernel-approved rationale sentences
POST /v1/tender/jobs                  multipart file → { job_id }
GET  /v1/tender/jobs/{id}             → { status, progress, items_done, items_total }
GET  /v1/tender/jobs/{id}/events      SSE progress
GET  /v1/tender/jobs/{id}/report      → item×standard×status matrix + findings
GET  /v1/tender/jobs/{id}/export?format=docx|pdf|json|csv
GET  /v1/standards/{family_id}        → record, editions, status chain, evidence tier
GET  /v1/standards/{family_id}/allied → neighbours with edge_type + provenance
GET  /v1/certification?family_id=…&as_of=…   → rules with source + dates
GET  /v1/coverage                     → real tier counts per domain (Tier A/B/C/D)
POST /v1/feedback                     { request_id, family_id, label, note? }
GET  /v1/health, /v1/version          → index_version, model ids, git sha
```

### 9.2 Result object (per recommended standard) — fields produced by code, never by the LLM

```json
{
  "family_id": "…", "is_number": "IS 1786", "edition_year": 2008,
  "title_en": "…", "title_hi": "…|null",
  "role": "PRIMARY|TEST_METHOD|TERMINOLOGY|SAFETY|INSTALLATION|MATERIAL|RELATED",
  "evidence_tier": "CLAUSE_EVIDENCE|CATALOGUE_EVIDENCE|UNVERIFIED",
  "confidence_label": "HIGH|MEDIUM|VERIFY",
  "score_breakdown": {"semantic":0.0,"lexical":0.0,"rerank":0.0,"scope":0.0,"constraints":"SATISFIES|UNKNOWN|VIOLATES","graph":0.0},
  "status": {"value":"CURRENT|AMENDED|UNDER_REVISION|SUPERSEDED|WITHDRAWN|UNKNOWN","as_of":"YYYY-MM-DD","source":"…","source_date":"…"},
  "amendments": [{"no":1,"date":"…","source":"…"}],
  "certification": {"result":"MANDATORY|NOT_IDENTIFIED|REQUIRES_VERIFICATION","scheme":"ISI|CRS|HALLMARK|OTHER|null","rules":[{"qco":"…","gazette_ref":"…","effective":"…","source_url":"…","verified_on":"…"}]},
  "evidence": [{"clause_id":123,"path":"Cl 5 > Table 3","page":12,"bbox":[x0,y0,x1,y1],"text":"…","ocr_quality":0.98}],
  "rationale": [{"text":"…","evidence_ids":[123]}],
  "allied": [{"family_id":"…","edge_type":"…","provenance":"…"}]
}
```
(The example values above are shape illustrations only; real responses contain only database-backed values.)

### 9.3 Portal integration (F7)

- Versioned REST API with API keys (hashed in Postgres), per-key rate limits, CORS allow-list, webhook on tender-job completion.
- **Embeddable web component** `<is-recommender api-base="…" api-key="…" lang="en">` built from the same UI components; plus an iframe-friendly route `/embed`.
- Inputs a portal can pass: item description, HS code, portal category, tender date (as `as_of_date`).
- **Honesty rule:** no verified information exists about GeM/CPPP integration interfaces. Demonstrate integration with a clearly labelled *host-page demo* (a static page embedding the widget) and the documented API. Do not claim integration with a specific portal.

---

## 10. LLM layer, evidence pack, Verification Kernel

### 10.1 `LLMClient` interface (`api/llm/`)

```python
class LLMClient(Protocol):
    def complete_json(self, *, task: str, system: str, user: str,
                      schema: type[BaseModel], model_tier: Literal["fast","reason"],
                      max_tokens: int) -> BaseModel: ...
    def stream_text(...) -> Iterator[str]: ...      # optional
    def supports_images(self) -> bool: ...
```
Implementations: `AnthropicClient` (official SDK), `OpenAICompatibleClient` (any `/v1/chat/completions`-style endpoint — local or hosted), `NullClient` (raises `LLMUnavailable`; callers use deterministic fallbacks). Temperature 0. Log task name, latency, token counts, provider, model (not prompt text if it contains tender content, unless `LOG_PROMPTS=true`). A test asserts each task has a working `NullClient` fallback.

### 10.2 LLM tasks (exhaustive list — no others)

| Task | Input | Output schema | Fallback when LLM unavailable |
|---|---|---|---|
| `extract_requirements` | normalized query | `RequirementSpec` | deterministic parse only |
| `propose_citations` | paragraph(s) mentioning standards | `[{span, candidate_text}]` | L1/L2 only |
| `classify_sections` / `extract_items` | tender text chunks | typed section/item lists | heading rules + table detection |
| `write_rationale` | **evidence pack only** | `{rationale_sentences:[{text, evidence_ids[]}], gap_explanations:[…]}` | deterministic template from evidence pack |
| `localize_rationale` (optional) | English kernel-approved sentences + target language | translated sentences | show English |
| `caption_figure` (feature-flagged) | image crop | short caption | skip |

The LLM has **no tools, no retrieval, no browsing**. It never writes IS numbers, editions, status, certification, roles, or numeric values that are not in its input.

### 10.3 Evidence pack

Structured JSON assembled by code: standards (role, tier, edition, status), clause spans (id, text, page, bbox), constraint results, allied edges with provenance, certification findings, gaps, exclusions. `write_rationale` sees only this. Untrusted tender text is passed as delimited *data* with an instruction that it is data; output is schema-validated; the kernel runs downstream. Include an injection-pattern test set (Section 15).

### 10.4 Scoring and abstention

Features per standard: semantic, lexical/exact, cross-encoder, scope match, constraint result, exclusion penalty, graph support (declared edges weighted), status validity, evidence tier, OCR quality. **Phase 1:** transparent weighted sum with weights in a versioned YAML file, chosen by tuning on the gold set (record the tuning run). **Phase 3 (optional):** learned ranker + calibration if enough labelled data exists.
Confidence labels `HIGH/MEDIUM/VERIFY` come from thresholds tuned on the gold set to meet an **asserted-precision target you set with the human** (suggested starting target 0.95; state the achieved value honestly). Never display raw uncalibrated decimals as probabilities. `CATALOGUE_EVIDENCE` results can be at most `MEDIUM`; results with no evidence above threshold produce an explicit **abstention** ("no standard identified with sufficient confidence") with nearest candidates as `VERIFY`.

### 10.5 Verification Kernel (`verification_kernel/`, independently testable, no dependency on the LLM client)

| Invariant | Check | Failure action |
|---|---|---|
| Existence (hard) | every IS ID in any output field/text exists in the catalogue after canonicalization | strip; flag `NOT_IN_CORPUS` |
| Grounding (hard) | each rationale sentence cites `evidence_ids` that exist in the pack, and the cited span belongs to the standard the sentence is about | strip sentence |
| Numeric fidelity (hard) | every number+unit in generated text appears in the evidence pack or the query after normalization | strip sentence |
| Status/certification fidelity (hard) | these fields are rendered from structured data only; kernel rejects LLM text containing status/certification claims not in the pack | strip |
| Exclusion (hard, Phase 3) | no matched exclusion for an asserted standard | downgrade to candidate |
| Translation fidelity (hard) | IDs, numbers, units identical before/after localization | fall back to English |
| Evidence quality (soft) | low `ocr_quality` lowers confidence | lower score, never abstain alone |

Hard failures are never silently retried. Record the **strip rate** per task — it is the faithfulness metric on the evaluation dashboard. If all rationale sentences are stripped, the UI shows structured results without rationale (still correct).

**Degradation ladder (tested):** (1) full; (2) LLM unavailable → deterministic query parse + template rationale; (3) reranker unavailable/too slow → skip rerank, mark `degraded.reranker=true`; (4) Qdrant unavailable → Postgres trigram/exact + FTS on titles/scope only, banner shown. Each rung has an automated test.

---

## 11. Allied-standards graph (F3)

Stored in Postgres `edges` (Appendix A). Every edge has a **provenance class** and shows it in the UI. Never present an inferred edge as normative.

| Provenance | Source | Confidence | UI label |
|---|---|---|---|
| `DECLARED_CATALOGUE` | Cross-reference lists in the BIS catalogue **if U1 confirms they exist** | 1.0 | Normative / allied |
| `DECLARED_TEXT` | Parsed "References"/normative-reference sections and annexes of Tier B PDFs (page + clause stored) | 1.0 | Normative / allied |
| `CATALOGUE_STATUS` | supersedes / amended-by from catalogue or gazette | 1.0 | Version chain |
| `QCO_TABLE` | IS numbers listed together in one QCO table row/order | 1.0 (for "same regulated product") | Certification-related |
| `INFERRED_CITATION` | In-body mentions in Tier B text | ~0.7 | Referenced in text |
| `INFERRED_STATISTICAL` | Co-citation, shared committee/classification, embedding similarity | ≤ 0.5 | Commonly co-specified |

`edge_type` values: `PRIMARY`, `TEST_METHOD`, `TERMINOLOGY`, `SAFETY`, `INSTALLATION`, `MATERIAL`, `RELATED_PRODUCT`, `INTL_EQUIVALENT`, `SUPERSEDES`, `AMENDS`. Role assignment for `DECLARED_*` edges uses deterministic cues first (section heading, title keywords such as "methods of test", "terminology", "code of practice for installation"), then an optional LLM classifier whose output is validated against the same cue list; unclassified edges get `RELATED_PRODUCT`. Traversal: recursive CTE, depth 1 for queries, depth ≤ 2 for tenders, hard caps on fan-out (configurable). If a standard is `CATALOGUE_EVIDENCE` only and no edges exist, say so — do not fabricate allied standards.

Optional (Phase 4, `FEATURE_NEO4J`): project `edges` into Neo4j for Cypher path queries and graph visualization; add a parity test (CTE vs Cypher neighbour sets identical). Postgres remains the truth.

---

## 12. Version and amendment engine (F4)

State per edition: `CURRENT`, `REAFFIRMED(year)`, `AMENDED(n)`, `UNDER_REVISION`, `SUPERSEDED`, `WITHDRAWN`, `UNKNOWN`. Identity is `(family, part)` → edition chain. Evaluation uses an **as-of date** (default = tender date if given, else today).

- **Sources, in order of authority:** BIS catalogue/KYS fields (whatever U1 confirms), BIS "New/Revised Standards" listings (V3), gazette notifications linked from KYS. Each status row stores `source_url`, `retrieved_at`, `content_hash`.
- If no source establishes status → `UNKNOWN` with an explicit "verify on BIS" note. **Never infer `CURRENT` from absence of a supersession record** unless the catalogue itself asserts in-force status.
- A cited edition older than the latest known edition → `STALE_EDITION`. A tender citing a standard **without** year → note "edition not specified; latest is …".
- **Amendments (Phase 3, Tier B only):** parse an amendment document into patch ops `{SUBSTITUTE|INSERT|DELETE, target_clause, new_text}` (rules + LLM proposer; low-confidence patches flagged for human review). Store `original_text` and `effective_text`; chunk IDs are deterministic so only changed chunks re-embed. For catalogue-only standards, list amendment existence/number/date as metadata (if available) without pretending to know the text.

---

## 13. Certification registry (F5)

**Model:** compulsory certification is driven by Government orders (QCOs) that are notified, amended, extended, rescinded and reinstated (V6, V7, V9). Therefore certification is a **time-stamped rule set**, never a static property of a standard.

**Sources (Tier D):** QCO and amendment-order PDFs on `egazette.gov.in` (V7); BIS "Products under Compulsory Certification" page and linked lists (V6); BIS mandatory-hallmarking orders (V9); CRS listings at `crsbis.in` (V11). Discover the QCO list from the BIS page first (U6); do not guess gazette URLs.

**Ingestion (Appendix B10):** parse the **English** portion (V8) of each order: title, issuing ministry, notification date/number, commencement clause, table of goods ↔ IS numbers, scheme (ISI/CRS/other) if stated. Verify every IS number against the catalogue; unverifiable rows go to a human-review queue, not into rules. Link amendment/extension orders to their principal order and apply them in date order; if the chain cannot be established, mark the rule `REQUIRES_VERIFICATION`.

**Effective dates:** compute `effective_date` deterministically only when the commencement clause is a fixed date or a simple offset from a known publication date (e.g. "six months from the date of publication"). Provisos (e.g. different dates for small enterprises) are stored as text in `effective_note` and force `REQUIRES_VERIFICATION` for the affected applicability until reviewed.

**Matching rule → output:**
- Standard's `family_id` appears in an in-force rule's table (deterministic) → `MANDATORY` with QCO title, gazette reference, effective date, source URL, verified-on date.
- Matched only by product-name similarity → `REQUIRES_VERIFICATION` (never `MANDATORY`).
- No rule found → `NOT_IDENTIFIED` (wording: "no compulsory-certification order identified in the registry as of DATE"; never "not required").
- Always show the as-of date and a banner: "Regulatory orders change; verify against the Gazette and BIS before use."

Hallmarking rules are district- and date-phased; store them with their own dates and only surface them when the product/query concerns hallmarkable articles. `admin` role may add manual overrides in Phase 3; every override is audit-logged with reason.

---

## 14. Product surface (Next.js + `next-intl`)

### 14.1 Officer workspace
- **Search page:** text box (multi-line), language selector, as-of date, optional HS code/category; example prompts must come from real queries in the gold set, not invented ones.
- **Results:** grouped by role (primary, test methods, terminology, safety, installation, related); each card shows IS number + edition, status badge (with as-of/source), certification badge (with QCO reference), evidence-tier badge, calibrated confidence label with per-dimension bars, evidence snippet with page number and (when available) the page image with bounding box, allied standards with provenance labels.
- **Considered and excluded** section; **Gaps / verify** section; **clarifying questions** as tappable chips.
- **Progressive rendering:** structured results first; rationale streams afterward and only kernel-approved sentences are shown.
- **Clause generator:** deterministic template producing e.g. "The goods shall conform to IS <number>:<year> (status as of <date>) …" from structured fields only; officer can copy or export it.
- **Tender workspace:** upload, progress (SSE), item × standard × status matrix, lint findings filterable by type, export.
- **Standard page:** record, edition chain, amendments, allied graph view (rendered from Postgres edges), evidence.
- **Coverage page:** real Tier A/B/C/D counts per domain (Section 4) and the list of features currently degraded/off.
- **Feedback** buttons (correct / wrong / missing) writing to `feedback`.

### 14.2 Internationalization
`next-intl` with message files per locale. Ship **English and Hindi** first; adding a locale must require only a new message file. Machine-drafted UI strings must be flagged `needs_review` in the file until a human reviewer approves. Query language and UI language are independent. Standard IDs, numbers and units are never localized.

### 14.3 Embeddable widget and exports
- Web component `<is-recommender>` and `/embed` route (Section 9.3), styled with CSS variables for host theming.
- Exports: JSON, CSV, DOCX (`python-docx`), PDF (WeasyPrint or ReportLab — pick one that installs cleanly in the image). Exports contain the same structured fields plus as-of date, source URLs and the coverage/limitations note.

### 14.4 Quality bars
Keyboard-navigable, semantic HTML, sufficient contrast, responsive down to ~380 px width. Every non-trivial claim on screen has a visible provenance affordance (tooltip/drawer listing source, date, page).

---

## 15. Evaluation (real data first)

**Rule:** the corpus is always real. Synthetic content is allowed only as *query text* derived from real scope statements and then paraphrased/de-lexicalized to reduce leakage.

### 15.1 Tiers
1. **Regulatory-table ground truth (real):** QCO tables give real "goods → IS number" pairs (V7). After parsing (U6), use them to build product→standard test cases with authoritative labels. Verify layout on real PDFs before trusting the parser.
2. **Hand-labelled gold (target 200–300):** written by humans (the team, ideally with a procurement/domain reviewer): exact-ID, product description, technical-spec fragments, multilingual (Hindi, Hinglish, at least one more scheduled language) and tender-item cases from real tenders. Labels record `expected_family_ids`, `allowed_alternates`, `expected_roles`. **LLM-translated queries must be reviewed by a fluent human before entering the gold set.**
3. **Synthetic queries (thousands, optional):** generated from real scope text, paraphrased; used for tuning/regression only, reported separately from gold.
4. **Adversarial (~100):** out-of-corpus products, superseded/old-edition citations, near-duplicate scopes, unit conflicts, noisy OCR, prompt-injection tenders, fake IS numbers injected into rationale paths.

Store every set in `eval/` as versioned YAML/JSONL with a provenance field (who/what/when). Never leak gold standards' text into prompts or tuning of the scorer beyond a held-out split (document splits).

### 15.2 Metrics
Retrieval: Recall@1/3/5, MRR, nDCG@10 (per tier and per language). Allied standards: precision/recall against `DECLARED_*` edges. Version/certification: exact-match accuracy against registry/catalogue. Abstention: precision of asserted recommendations, coverage, risk-coverage curve. Faithfulness: kernel strip rate per task; optional Ragas/TruLens-style context precision/recall/faithfulness using whichever judge model is configured (report which). Multilingual parity: Recall@5 per language ÷ English. Parsing: OCR character error rate and table-extraction F1 on a small human-annotated sample. Performance: p50/p95 per stage.

### 15.3 Ablation table (deliverable for the pitch)
Dense-only → +sparse → +cards-first → +rerank → +graph → +constraints → +kernel, with metric deltas at each step, generated by `eval/run_ablation.py` from the same gold set.

---

## 16. Testing, CI, operations

**Tests:** unit + property-based (Hypothesis) for the ID normalizer, unit engine and query parser; golden tests for the citation extractor on real noisy strings collected from real tenders; kernel fuzz test injecting fake IDs/numbers into rationale (must be stripped 100%); degradation-ladder tests (kill LLM/reranker/Qdrant in integration tests); ephemeral-Compose integration tests for ingestion → index → query; API contract tests from OpenAPI; UI smoke tests (Playwright).
**CI (GitHub Actions):** lint/type (ruff, mypy, eslint, tsc); unit/property tests; integration tests; **hygiene job** (Section 17); image build; evaluation regression gate **once a baseline exists** (fail on Recall@5 drop beyond a documented tolerance or any hard-invariant failure).
**Security basics:** upload size/page/type limits; parse uploads in a non-root container; malware scan hook (ClamAV optional); secrets only via env; API keys stored hashed; SSRF-safe adapters (allow-listed hosts only); rate limits; injection tests (Section 10.3).
**Observability (minimal):** structured JSON logs with request_id; `/v1/health`; per-stage timing in responses (`X-Timing` header) and stored for `docs/latency.md`; Prometheus metrics optional (Phase 4).
**Serving:** Gunicorn + Uvicorn workers for the API, `next build && next start` for the web app, no `--reload`/dev servers in the demo compose file. API and worker containers are stateless; all state lives in Postgres, Qdrant, Redis and the blob volume.
**Latency targets (measure; do not quote until measured; record in `docs/latency.md`):** deterministic parse < 50 ms; card+clause retrieval+RRF < 300 ms; rerank of 48 candidates < 1 s on GPU (CPU: reduce `RERANK_TOP_N`); structured results to UI < 3 s end-to-end excluding rationale; rationale streamed after.

---

## 17. Repository layout and git rules

```
/api/                    FastAPI app: routers, services, llm/, retrieval/, applicability/, graph/, versioning/, certification/
/verification_kernel/    invariants; imports nothing from llm/
/data_pipeline/          adapters/, parsing/, structure/, extraction/, indexing/, tasks/ (Celery)
/ranking/                scoring, weights.yaml, calibration, reranker wrapper
/web/                    Next.js app (+ embeddable web component)
/eval/                   gold/, adversarial/, synthetic/, run_eval.py, run_ablation.py
/infra/                  docker-compose.yml, Dockerfiles, (helm/ Phase 4)
/docs/                   architecture.md, sources.md, blockers.md, latency.md, scope.md, licences.md
/research/               optional exploratory notebooks (excluded from build)
README.md  CONTRIBUTING.md  .env.example  .gitignore  .pre-commit-config.yaml  .github/workflows/
```

**Never committed:** PDFs, page renders, vector indexes, databases, model weights, logs, scratch files, `.env`, notebooks outside `/research/`, and AI-agent scaffolding (`CLAUDE.md`, `AGENTS.md`, prompt dumps, `.agents/`). Keep such files local (`.git/info/exclude`) or delete before submission; design intent belongs in `docs/`, written for humans.
**Tooling:** `.gitignore` in the first commit; pre-commit (ruff/black/mypy, eslint/prettier, `detect-secrets`, max-file-size 1 MB); CI `hygiene` job fails on tracked forbidden patterns or oversized files.
**Workflow:** branch per phase item (`phase1/card-retrieval`), PR with green CI, no direct pushes to `main` after Phase 0, conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), tags at milestones (`v0.1-phase0` …). The README "Run it" section must work from a clean clone with `docker compose up` plus documented seed steps.

---

## 18. Build plan with acceptance tests

Each phase ends with a demonstrable, honest system. Check the boxes only when verified by a test or a recorded measurement.

### Phase 0 — Foundations (no user-visible output)
- Repo scaffold, hygiene baseline (Section 17), CI skeleton, Compose with `postgres`, `qdrant`, `redis`, `api`, `worker`.
- Postgres schema + Alembic migrations (Appendix A).
- **ID normalizer with property-based tests** (Appendix B.1) — build before any ingestion.
- Source registry table + hashing + polite HTTP client (rate limit, robots check, allow-listed hosts).
- `LLMClient` interface with the three providers + `NullClient` fallbacks.
- **Source reality check (Section 4.2):** produce `docs/sources.md` with findings for U1–U8; raise human-only items (U2, U3, U4, U5, U8) in `docs/blockers.md`.
- [ ] Insert a standard and retrieve it by any of its ID spellings (test vectors from V10).
- [ ] `docs/sources.md` records each U-item resolution with date.

### Phase 1A — Catalogue MVP (Tier A)
- Catalogue adapter for whichever real source U1/U2 allow; reconciliation by `family_id`; `ingest_rejects` report for unparseable IDs.
- BGE-M3 card embeddings → Qdrant `cards`; exact-ID + trigram search; card retrieval with RRF.
- `POST /v1/query`, `GET /v1/standards/{id}`, `GET /v1/coverage`; minimal Next.js search page (English) showing cards with `CATALOGUE_EVIDENCE`, status `UNKNOWN` where unsourced.
- [ ] A real product-description query returns ranked real standards from the real catalogue.
- [ ] Exact-ID queries in every spelling variant resolve correctly.
- [ ] Coverage endpoint shows real, non-fabricated counts.

### Phase 1B — Clause evidence (Tier B) and rationale
- Human supplies PDFs (U3). Parse → structure → tables → contextual chunks → BGE-M3 → Qdrant `clauses`.
- Clause retrieval, rerank, standard-level aggregation, scoring with weights file, abstention path.
- LLM rationale + evidence pack + Verification Kernel hard invariants; degradation ladder rungs 1–2.
- Evidence viewer with page number (+bbox when available).
- [ ] Query about a Tier B product returns a real clause citation (page, text).
- [ ] Query about a catalogue-only standard returns `CATALOGUE_EVIDENCE`, not a false negative.
- [ ] Kernel test: an injected fake IS number and fake number are stripped.
- [ ] With `LLM_PROVIDER=none`, queries still return structured results.
- [ ] Measured p50/p95 per stage recorded in `docs/latency.md`.

### Phase 2 — Breadth: multilingual, allied graph, versions, certification, tenders
- Multilingual query path (Section 7.1); Hindi UI locale.
- `DECLARED_*` edges (catalogue if U1 confirms; parsed References for Tier B), graph traversal endpoint and UI.
- Version engine with sourced statuses; `STATUS_UNKNOWN` handling.
- Certification registry from real QCOs (Appendix B10, Section 13), API + UI badges with as-of date and banner.
- Tender pipeline and linter (Section 8), report UI and exports.
- [ ] A real Hindi query returns results with Recall@5 parity measured against its English counterpart on the gold set (report the number).
- [ ] A real tender fixture yields at least one correct lint finding verified against ground truth.
- [ ] `/v1/standards/{id}/allied` returns at least one `DECLARED_*` edge from real data (or `docs/sources.md` documents why none exist and only `DECLARED_TEXT` is used).
- [ ] A certification result cites a real QCO with gazette reference, effective date, source URL and verification date.

### Phase 3 — Depth and hardening
- Applicability engine (three-valued) + exclusions; learned/tuned scoring + calibration; amendment patches (Tier B); DOCX/PDF exports; embeddable widget + API keys + webhooks; optional JWT roles and audit log with hash chain; full eval suite + ablation table; CI eval-regression gate; optional Ragas/TruLens-style metrics.
- [ ] Abstention precision on gold meets the target agreed with the human (report achieved value).
- [ ] Widget renders inside the host-page demo and returns results via API key.
- [ ] CI blocks a change that drops Recall@5 beyond tolerance or fails a hard invariant.

### Phase 4 — Optional polish (only if time remains)
Neo4j projection with parity test; VLM figure captions (`FEATURE_VLM_CAPTIONS`); local-LLM profile with `openai_compatible` + documented test; observability dashboards; Helm chart; update watchers; Hindi/other-language UI review pass.

**Cut order under time pressure (bottom-up):** Phase 4 → Phase 3 extras (Ragas, audit chain, JWT) → applicability/amendments → tender exports → allied-graph UI polish. Never cut: real data, kernel hard invariants, evidence tiers, coverage report, as-of dates on regulatory claims.

---

## 19. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Catalogue cannot be obtained programmatically or terms forbid it | Phase 0 reality check (U1–U4); ask human for official export/dataset; fall back to permitted listings (V3); never synthesize |
| Full-text PDFs unavailable or licence-restricted | Tier B is human-supplied and private; product still works catalogue-only with honest tiers |
| Hosted LLM sends tender text off-site | Documented in README; `openai_compatible`/`none` profiles; only minimal spans sent |
| Hindi text in gazette PDFs garbled (V8) | Parse English part; treat Hindi extraction as unreliable |
| QCO layouts vary; effective-date clauses complex | Deterministic parse only when unambiguous; otherwise `REQUIRES_VERIFICATION`; human-review queue |
| BGE-M3/reranker slow on CPU | Reduce `RERANK_TOP_N`; batch embeddings offline; measure; GPU optional |
| Scope creep | Phase gating; cut order in Section 18 |
| Regulatory data goes stale | As-of dates everywhere; banner; update watchers in Phase 4 |
| Overclaiming in pitch | Only quote measured numbers; use wording from `docs/scope.md`; UNVERIFIED items may not be stated as fact |

---

## 20. Glossary
**IS** Indian Standard. **BIS** Bureau of Indian Standards. **KYS** "Know Your Standard" (V1). **QCO** Quality Control Order (V6). **ISI mark / CRS** BIS compulsory-certification schemes (V11). **Family ID** canonical identity collapsing all spellings of a standard (+part/section). **Evidence tier** `CLAUSE_EVIDENCE` / `CATALOGUE_EVIDENCE` / `UNVERIFIED`. **As-of date** date against which status/certification is evaluated. **Verification Kernel** deterministic checker that strips any generated output not grounded in the evidence pack. **RRF** reciprocal rank fusion.

---

## Appendix A — Data model (PostgreSQL 16; Alembic migrations; extensions `pg_trgm`, `pgcrypto`)

```sql
CREATE TABLE sources (
  id            BIGSERIAL PRIMARY KEY,
  kind          TEXT NOT NULL CHECK (kind IN ('CATALOGUE','IS_PDF','AMENDMENT_PDF','QCO_PDF','BIS_PAGE','TENDER','OTHER')),
  url           TEXT,
  adapter       TEXT,
  retrieved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sha256        TEXT NOT NULL,
  blob_path     TEXT,
  licence_note  TEXT,                       -- human-entered conclusion from U2/U3
  UNIQUE (sha256, kind)
);

CREATE TABLE standards (
  family_id     TEXT PRIMARY KEY,           -- e.g. 'IS:1786' | 'IS:13252:P1' | 'IS/ISO:6621:P2'
  prefix        TEXT NOT NULL,
  number        TEXT NOT NULL,
  part          TEXT,
  section       TEXT,
  title_en      TEXT,
  title_hi      TEXT,
  scope_text    TEXT,
  ics_class     TEXT,
  aspect        TEXT,
  committee     TEXT,
  domain        TEXT,                       -- derived grouping for filters/coverage
  tier          TEXT NOT NULL DEFAULT 'CATALOGUE_EVIDENCE' CHECK (tier IN ('CLAUSE_EVIDENCE','CATALOGUE_EVIDENCE')),
  raw_id        TEXT,                       -- as printed at source (incl. trailing marks)
  source_id     BIGINT REFERENCES sources(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX standards_title_trgm ON standards USING gin (title_en gin_trgm_ops);

CREATE TABLE editions (
  id              BIGSERIAL PRIMARY KEY,
  family_id       TEXT NOT NULL REFERENCES standards(family_id),
  year            INT,
  reaffirmed_year INT,
  status          TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (status IN ('CURRENT','REAFFIRMED','AMENDED','UNDER_REVISION','SUPERSEDED','WITHDRAWN','UNKNOWN')),
  status_source_id BIGINT REFERENCES sources(id),
  superseded_by   TEXT REFERENCES standards(family_id),
  effective_from  DATE, effective_to DATE,
  retrieved_at    TIMESTAMPTZ
);

CREATE TABLE amendments (
  id           BIGSERIAL PRIMARY KEY,
  edition_id   BIGINT NOT NULL REFERENCES editions(id),
  amendment_no INT, published_on DATE,
  source_id    BIGINT REFERENCES sources(id),
  patch_status TEXT DEFAULT 'NOT_PARSED' CHECK (patch_status IN ('NOT_PARSED','PARSED','NEEDS_REVIEW','APPLIED'))
);

CREATE TABLE clauses (
  id             BIGSERIAL PRIMARY KEY,
  edition_id     BIGINT NOT NULL REFERENCES editions(id),
  chunk_key      TEXT NOT NULL UNIQUE,      -- family_id:edition:path:hash8 (deterministic)
  path           TEXT,                      -- 'Cl 5 > Table 3'
  kind           TEXT CHECK (kind IN ('TEXT','TABLE_ROW','TABLE','FIGURE_CAPTION','DEFINITION','SCOPE','REFERENCE')),
  text           TEXT NOT NULL,             -- original text
  effective_text TEXT,                      -- after amendment patches
  embed_text     TEXT,                      -- breadcrumb-prefixed text actually embedded
  page           INT, bbox JSONB,
  ocr_quality    REAL,
  source_id      BIGINT REFERENCES sources(id)
);

CREATE TABLE edges (
  id            BIGSERIAL PRIMARY KEY,
  src_family_id TEXT NOT NULL REFERENCES standards(family_id),
  dst_family_id TEXT NOT NULL REFERENCES standards(family_id),
  edge_type     TEXT NOT NULL CHECK (edge_type IN ('PRIMARY','TEST_METHOD','TERMINOLOGY','SAFETY','INSTALLATION','MATERIAL','RELATED_PRODUCT','INTL_EQUIVALENT','SUPERSEDES','AMENDS')),
  provenance    TEXT NOT NULL CHECK (provenance IN ('DECLARED_CATALOGUE','DECLARED_TEXT','CATALOGUE_STATUS','QCO_TABLE','INFERRED_CITATION','INFERRED_STATISTICAL')),
  confidence    REAL NOT NULL,
  source_clause_id BIGINT REFERENCES clauses(id),
  source_id     BIGINT REFERENCES sources(id),
  UNIQUE (src_family_id, dst_family_id, edge_type, provenance)
);
CREATE INDEX edges_src ON edges(src_family_id); CREATE INDEX edges_dst ON edges(dst_family_id);

CREATE TABLE cert_rules (
  id             BIGSERIAL PRIMARY KEY,
  scheme         TEXT NOT NULL CHECK (scheme IN ('ISI_MARK','CRS','HALLMARK','OTHER')),
  order_title    TEXT NOT NULL,
  issuing_authority TEXT,
  gazette_ref    TEXT,
  notified_on    DATE,
  effective_date DATE,                      -- only when deterministic
  effective_note TEXT,                      -- provisos / unparsed conditions
  status         TEXT NOT NULL CHECK (status IN ('IN_FORCE','NOT_YET_IN_FORCE','RESCINDED','REINSTATED','REQUIRES_VERIFICATION')),
  principal_rule_id BIGINT REFERENCES cert_rules(id),  -- amendment/extension orders link here
  source_id      BIGINT NOT NULL REFERENCES sources(id),
  review_state   TEXT DEFAULT 'AUTO' CHECK (review_state IN ('AUTO','NEEDS_REVIEW','HUMAN_VERIFIED')),
  last_verified  TIMESTAMPTZ
);
CREATE TABLE cert_rule_items (
  id BIGSERIAL PRIMARY KEY, rule_id BIGINT NOT NULL REFERENCES cert_rules(id),
  goods_text TEXT NOT NULL, family_id TEXT REFERENCES standards(family_id), hs_code TEXT
);

CREATE TABLE clause_constraints (             -- Phase 3
  id BIGSERIAL PRIMARY KEY, clause_id BIGINT REFERENCES clauses(id),
  attribute TEXT, op TEXT, value NUMERIC, unit TEXT, value_text TEXT,
  kind TEXT CHECK (kind IN ('REQUIREMENT','EXCLUSION')), verified BOOLEAN DEFAULT false
);

CREATE TABLE tender_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), status TEXT, source_id BIGINT REFERENCES sources(id),
  progress JSONB, error TEXT, created_at TIMESTAMPTZ DEFAULT now(), finished_at TIMESTAMPTZ
);
CREATE TABLE tender_items (id BIGSERIAL PRIMARY KEY, job_id UUID REFERENCES tender_jobs(id), ordinal INT, text TEXT, qty TEXT, requirement_spec JSONB, result JSONB);
CREATE TABLE findings (id BIGSERIAL PRIMARY KEY, job_id UUID REFERENCES tender_jobs(id), item_id BIGINT REFERENCES tender_items(id), type TEXT, family_id TEXT, detail JSONB);

CREATE TABLE queries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), text TEXT, lang TEXT, as_of DATE, spec JSONB, response JSONB, kernel_strips JSONB, index_version TEXT, model_ids JSONB, latency_ms JSONB, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE feedback (id BIGSERIAL PRIMARY KEY, query_id UUID REFERENCES queries(id), family_id TEXT, label TEXT, note TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE api_keys (id BIGSERIAL PRIMARY KEY, key_hash TEXT UNIQUE NOT NULL, label TEXT, rate_limit INT, allowed_origins TEXT[], created_at TIMESTAMPTZ DEFAULT now(), revoked BOOLEAN DEFAULT false);
CREATE TABLE ingest_rejects (id BIGSERIAL PRIMARY KEY, source_id BIGINT REFERENCES sources(id), raw TEXT, reason TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE audit_log (id BIGSERIAL PRIMARY KEY, actor TEXT, action TEXT, detail JSONB, prev_hash TEXT, row_hash TEXT, created_at TIMESTAMPTZ DEFAULT now());  -- Phase 3
CREATE TABLE eval_runs (id BIGSERIAL PRIMARY KEY, set_name TEXT, git_sha TEXT, metrics JSONB, created_at TIMESTAMPTZ DEFAULT now());
```

**Qdrant collections** (`index_version` suffix, live via alias swap, never overwrite a live index):
- `cards_v<N>`: named vectors `dense` (BGE-M3 dense; size from the model — read it from the model, don't hard-code) and `sparse`; payload `{family_id, domain, tier, lang_available[], title_en}`.
- `clauses_v<N>`: same vectors; payload `{family_id, edition_year, path, kind, page, domain, chunk_key}`.
Rebuild = re-embed from Postgres `clauses.embed_text` and `standards` card text.

---

## Appendix B — Ingestion pipeline and ID normalizer

### B.1 Canonical ID normalizer (`data_pipeline/ids.py`) — build first
Maps any spelling to `{prefix, number, part, section, year, reaffirmed_year, marker, raw, family_id}`.
- Accepts (test vectors from real listings, V10): `IS 17440 : 2020`, `IS:1239`, `I.S. 1239 (Pt 1)`, `IS 13252(Part 1):2010`, `IS 302-2-26:2014`, `IS/ISO 6621-2:2020`, Devanagari-digit forms, extra/missing spaces, `Pt`/`Part`, trailing `*` (kept in `marker`).
- `family_id = <PREFIX>:<NUMBER>[:P<part>][:S<section>]` (prefix upper-case, `/` kept). Edition year is **not** part of `family_id`.
- Hyphenated tails (`302-2-26`) are interpreted as part/section **only if the catalogue confirms that convention**; otherwise emit `ambiguous=true` and record in `ingest_rejects` rather than guess.
- Two-digit or missing years → `year=null` (never guessed).
- **Property tests:** idempotence (`normalize(render(x)) == x`); whitespace/case/punctuation invariance; digit-script invariance; no exceptions on arbitrary text; unparseable → explicit `None` + reason.

### B.2 Pipeline (Celery tasks; idempotent by source `sha256`; retries with exponential backoff; dead-letter table; state in Postgres)
1. **Acquire** — adapters honour U2 conclusions; allow-listed hosts; rate limit; store bytes/HTML/JSON in blob store; write `sources` row (sha256, URL, date, licence note). Support `--dry-run`.
2. **Catalogue ingest** — map real fields to `standards`/`editions`; reconcile duplicates by `family_id`; unparseable IDs → `ingest_rejects`; produce a field-availability report for `docs/sources.md`.
3. **Parse PDFs** — Docling → structured document; PyMuPDF for geometry/born-digital text. **Page quality score** = combination of garbage-character ratio, script consistency, language-ID confidence, and layout confidence (not a raw character-count gate). Poor pages → Tesseract (`eng+hin`) → still poor → optional VLM transcription (if enabled). Store `ocr_quality` per chunk; it feeds soft scoring only, never a hard gate.
4. **Structure** — clause tree (Foreword, Scope, References, Definitions, Requirements, Tests, Marking, Annexes). Validate heading heuristics on real PDFs; on failure fall back to flat chunks with page provenance (never fail the document).
5. **Tables/figures** — tables stored as row JSON and serialized per row with breadcrumb (`IS <n>:<y> › Table 3 › <row header>: <col> = <value>`); figures get bbox + crop; optional caption via `caption_figure`.
6. **Contextual chunking** — `embed_text` = breadcrumb + text; deterministic `chunk_key`.
7. **Reference extraction** — parse the References/normative-reference section deterministically; verify each ID against `standards`; write `DECLARED_TEXT` edges with `source_clause_id`.
8. **Amendments (Phase 3)** — parse amendment PDFs to patch ops; low-confidence → `NEEDS_REVIEW`.
9. **Index** — BGE-M3 batch encode (dense+sparse) → Qdrant new `index_version` → alias swap; re-embed only changed `chunk_key`s.
10. **QCO ingest** — per Section 13; English portion only; verify IS numbers; `NEEDS_REVIEW` for anything uncertain.
11. **Coverage stats** — materialized view feeding `/v1/coverage`.
12. **Update watchers (Phase 4)** — scheduled re-run of adapters, diff, alert on status changes for watched standards.

---

## Appendix C — Corrections relative to earlier drafts (v1/v2)
| Earlier claim / decision | Now |
|---|---|
| Standards after 1 Oct 2025 moved to `manakonline.in` | **Unsupported** (V4). Removed. |
| "~24,000 standards" | Use ~22.7k (V5) and measure. |
| KYS exposes referred-to/referring lists, degree of equivalence, reaffirmation year | **UNVERIFIED** (U1). Implement only what exists. |
| e-Gazette BIS notifications issued by a "BIS Department of Consumer Affairs" | QCOs are issued by **line ministries** and published in the Gazette (V7). |
| Local/sovereign LLM as a must-fix (M1); no-egress CI test; cloud restrictions | Not in the problem statement. Provider-agnostic, hosted default, local optional. |
| Keycloak/RBAC, Neo4j mandatory, MinIO mandatory, IndicTrans2 | Optional or dropped; see Section 3. |
| Latency "well under a second" | Targets only; measure before claiming. |
