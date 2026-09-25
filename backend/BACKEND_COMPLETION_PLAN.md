# BACKEND COMPLETION PLAN

## 1. Abstraction Layers
- **Existing**: `api_service.py` and services directly call `sqlite3.connect()` or rely on hardcoded paths. No vector store abstraction (local fastembed). No graph store abstraction.
- **Gap**: Need clean repository interfaces to decouple SQLite logic from services and pave the way for PostgreSQL, Qdrant, and Neo4j.
- **Implementation**: Create `backend/repositories/base.py`, `standard_repository.py`, `graph_repository.py`, `vector_store.py` with Abstract Base Classes (ABCs) and concrete SQLite/local implementations.
- **Tests**: Test local implementations using mock SQLite tables.

## 2. Service Hardening
- **Applicability Service**: Needs to parse `>`,`<`,`>=`,`<=` explicitly if present, handle robust unit checks, and return `UNKNOWN` for unsupported constraints instead of hallucinating.
- **Version Service**: Must strictly handle relationships (supersedes, superseded_by, effective_date) rather than simple labels.
- **Regulatory Service**: Needs structured mandatory vs conditional rules representation, with UNKNOWN fallback.
- **Allied Standards**: Needs structured enumeration mapping for relationships.
- **Tender Intelligence**: Deepen `TenderService` to structure BoQ tables properly. Hardening `TenderHealthService` with `ERROR`, `WARNING`, `INFO`. Complete `CompletenessService` with structured gaps. Complete `SpecificationService`.
- **API Contracts**: Standardize errors (e.g. `{ "error": { "code": ..., "message": ... } }`). Add health liveness vs readiness. Add `.env` config structure.

## 3. Data-Dependent Limitations
- Graph relationships (Neo4j), semantic vectors (Qdrant), and exhaustive IS standards (PostgreSQL) are stubbed via local SQLite mappings. The architecture will support swapping via Repositories, but tests and local dev will rely strictly on local stubs.
