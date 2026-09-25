# FINAL BACKEND ARCHITECTURE

## Layered Architecture
```
CLIENT (React/Vite)
       ↓
API (FastAPI, /api/v1/*)
       ↓
APPLICATION SERVICES (Tender, Applicability, Version, etc.)
       ↓
REPOSITORIES (StandardRepository, GraphRepository, VectorStore, etc.)
       ↓
INFRASTRUCTURE PROJECTIONS:
- PostgreSQL (Authoritative Relational Truth)
- Qdrant (Rebuildable Vector Projection for Semantic Search)
- Neo4j (Rebuildable Graph Projection for Allied Standards)
- Local SQLite/InMemory (Local/Testing fallback)
       ↓
VERIFICATION / EVIDENCE (Constraint Engine, Verification Kernel)
```

## Source of Truth vs Projections
- **PostgreSQL** is the authoritative source for all Standards, Versions, Revisions, Regulations, and textual evidence.
- **Qdrant** is a projection built via `backend/data_pipeline/index_vectors.py`. It holds chunked semantic embeddings for dense retrieval.
- **Neo4j** is a projection built via `backend/data_pipeline/build_graph.py`. It holds relationship nodes (Normative, Supersedes, Test Methods, etc).
- **SQLite** is explicitly for local development fallback and unit testing.

## Local vs Production Mode
Configured via `backend/config.py` (`.env`).
If `QDRANT_HOST` or `NEO4J_URI` is inaccessible, the system does not silently fake production data, but local development fallback can be opted into.

## Ingestion
Raw BIS data is fetched via `data_pipeline/fetch_standards.py` -> cleaned -> pushed to Postgres. From Postgres, vector and graph builders re-project the changes automatically.
