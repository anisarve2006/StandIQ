# SIH 26108 — MaanakAI
## Project Brain / Source of Truth

### 01 — PROJECT IDENTITY
Project: MaanakAI
SIH Problem: 26108
Purpose: AI-powered recommendation engine for identifying applicable Indian Standards for procurement specifications.

### 02 — PROBLEM STATEMENT
Procurement officials preparing technical specifications for public tenders frequently struggle to identify applicable Indian Standards (IS), resulting in obsolete standard citations, QCO violations, and incomplete specifications.

### 03 — CURRENT PRODUCT STATUS
FRONTEND: Complete standalone prototype (currently using local demo fixtures and React state).
BACKEND: **APPLICATION-LAYER COMPLETE**. Repositories abstraction, procurement intelligence services, and unified API contracts are completed. 
PRODUCTION DATA / INFRASTRUCTURE: **PENDING**. Real standards, Neo4j, Qdrant, and PostgreSQL schemas are stubbed via local SQLite fallbacks.
FRONTEND ↔ BACKEND: Not yet integrated. Both reside in the same repository but operate independently.
DATABASE: Backend-side implementation (SQLite/PostgreSQL schema).
AI ENGINE: Backend-side implementation (Local FastEmbed, Groq, PyMuPDF, etc.).

### 04 — REPOSITORY STRUCTURE
SIH26108-MaanakAI/
├── frontend/ (React/Vite workspace)
├── backend/ (FastAPI engine)
├── BRAIN.md (This file)
├── README.md
└── .gitignore

### 05 — FRONTEND ARCHITECTURE
Technologies: React, TypeScript, Vite, Tailwind CSS.
Features: 
- Dashboard
- Procurements
- Requirements
- Standards
- Tender Health
- Review
- Evidence
- Graph
- Basket
- Specification Builder
- Approval
- Export
- Changes
- Settings
- Search

### 06 — BACKEND ARCHITECTURE
Technologies: FastAPI, Uvicorn, Python 3.10+.
Structure:
- `api_service.py`: Entry point for FastAPI.
- `retrieval/`: Core retrieval engine (compiler, reranker, hybrid search, verification).
- `data_pipeline/`: Data ingestion scripts for BIS and QCO data.
- `data/`: Local storage for SQLite DB and sample fixtures.
- `eval/`: Benchmark suite.

### 07 — AI / RETRIEVAL PIPELINE
Input
↓
Query compilation / entity guard
↓
Multilingual processing
↓
Exact matching
↓
FTS/BM25
↓
Dense retrieval (fastembed BGE)
↓
Reranking (MaxSim)
↓
Applicability & Constraint Verification
↓
Version & Certification Check
↓
Graph expansion
↓
Tender Intelligence & Completeness
↓
Verification Kernel
↓
Evidence pack
↓
Optional LLM synthesis (Groq)
↓
API response

### 08 — DATA & DATABASE
Supported: SQLite (default fallback) and PostgreSQL (via docker-compose).
Stores standards, certification rules, and graph relationships.

### 09 — FRONTEND ↔ BACKEND BOUNDARY
CURRENT STATE:
Frontend and backend are now located in the same repository, but they are NOT yet connected.
Frontend: local demo fixtures + local React state
Backend: FastAPI + actual retrieval/AI/data pipeline (Tested independently via pytest using synthetic fixtures)

NEXT INTEGRATION STEP:
Connect the frontend to the verified backend API contract.

### 10 — CURRENT API CONTRACT
METHOD: GET
ROUTE: `/api/v1/health`
PURPOSE: Healthcheck and corpus metrics.

METHOD: POST
ROUTE: `/api/v1/recommend`
PURPOSE: Recommendation for text query.
REQUEST: `{"query": "string", "top_candidates": int}`

METHOD: GET
ROUTE: `/api/v1/standard/{family_id}`
PURPOSE: Fetch metadata and allied graph.

METHOD: POST
ROUTE: `/api/v1/recommend/pdf`
PURPOSE: Tender PDF compliance matrix.

METHOD: GET
ROUTE: `/api/v1/search`
PURPOSE: Global fast lexical + semantic search for standards discovery.

METHOD: POST
ROUTE: `/api/v1/verify`
PURPOSE: Standalone verification of a tender clause against an evidence pack.

METHOD: GET
ROUTE: `/api/v1/standard/{family_id}/allied`

METHOD: GET
ROUTE: `/api/v1/standard/{family_id}/versions`

METHOD: GET
ROUTE: `/api/v1/standard/{family_id}/certification`

METHOD: POST
ROUTE: `/api/v1/tender/analyze`

METHOD: POST
ROUTE: `/api/v1/tender/health`

METHOD: POST
ROUTE: `/api/v1/tender/diff`

METHOD: POST
ROUTE: `/api/v1/specification/generate`

METHOD: POST
ROUTE: `/api/v1/procurements/session`

METHOD: GET
ROUTE: `/api/v1/procurements/session/{session_id}`

METHOD: POST
ROUTE: `/api/v1/export`

### 11 — USER WORKFLOW
Dashboard → Procurement Workspace → Requirement Understanding → Standards Discovery → Standard Detail → Evidence Viewer → Tender Health → Tender Diff/Fix → Review & Verify → Standards Basket → Specification Builder → Approval → Export.
(Currently frontend-only simulation).

### 12 — MAANAKAI CAPABILITIES
Natural language recommendation, Hybrid retrieval, Semantic retrieval, Tender PDF processing, BIS standards retrieval, Certification/QCO handling, Knowledge graph expansion, Verification, Evidence/provenance, Multilingual handling.

### 13 — FRONTEND CAPABILITIES
Procurement workspace, Requirement understanding, Standards discovery, Standard detail, Evidence viewer, Tender health, Tender diff/fix, Review & verification, Knowledge graph visualization, Standards basket, Specification builder, Approval, Export workflow, Changes & alerts, Global search, Settings.
These currently operate on frontend-local/demo data.

### 14 — DATA SOURCES
Scraped BIS/QCO Gazette data and static json lists.

### 15 — ENVIRONMENT & DEVELOPMENT
Frontend: `npm install` and `npm run dev`.
Backend: `pip install -r requirements.txt` and `uvicorn api_service:app --reload`.
Configuration via `.env`.

### 16 — TESTING & VALIDATION
Backend benchmark evaluation available in `eval/` folder.

### 17 — KNOWN LIMITATIONS
- Frontend/backend integration not yet completed.
- Backend database initialization requirements (needs scraping/load).
- Real BIS portal dependency for live scraping.
- LLM provider dependency if Groq is enabled.
- Neo4j and Qdrant are NOT implemented (simulated locally).
- Production DB is not populated.

### 18 — FUTURE INTEGRATION PLAN
01 Verify backend locally
02 Verify API responses
03 Create frontend API service
04 Replace frontend mock data incrementally
05 Connect: Procurement → Recommendation
06 Connect: Standards → Standard Detail
07 Connect: Tender Upload → Tender Analysis
08 Connect: Evidence → Backend Evidence
09 Connect: Verification → Backend Verification
10 End-to-end testing

### 19 — IMPORTANT FILES
- `backend/api_service.py`
- `backend/retrieval/engine.py`
- `frontend/src/app/App.tsx`
- `frontend/package.json`

### 20 — CHANGE / DEVELOPMENT RULES
No structural changes to backend data pipeline or frontend UI framework without explicit architectural review. Keep boundaries clean until API integration.
