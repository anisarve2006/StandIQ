# BACKEND BASELINE

## 1. Test Suite State
- **Test Count**: 5 tests
- **Passing**: 5 (`test_healthcheck`, `test_query_compiler`, `test_multilingual_compiler`, `test_retrieval_and_recommendation`, `test_verification_kernel`)
- **Failing**: 0
- **Skipped**: 0

## 2. API Routes
- `GET /api/v1/health`
- `POST /api/v1/recommend`
- `GET /api/v1/standard/{family_id}`
- `POST /api/v1/recommend/pdf`
- `GET /api/v1/search`
- `POST /api/v1/verify`

## 3. Core Modules Protected (STABLE)
- `retrieval/engine.py`
- `retrieval/compiler.py`
- `retrieval/hybrid_search.py`
- `retrieval/reranker.py`
- `retrieval/multilingual.py`
- `retrieval/verification_kernel.py`
- `retrieval/constraint_engine.py`
- `retrieval/graph_expander.py`
- `retrieval/completeness_loop.py`
- `retrieval/evidence_pack.py`
- `retrieval/pdf_processor.py`

## 4. Known Behavior
- `POST /api/v1/recommend` extracts entities, runs hybrid search + reranking, verifies constraints, expands graph, and generates evidence/clause.
- `POST /api/v1/recommend/pdf` extracts text/tables from PDF, loops over items, and executes `/recommend` flow on each item.
- `GET /api/v1/standard/{family_id}` executes SQL queries for exact standard graph and certification status.
- `GET /api/v1/search` performs lexical+semantic FTS search.
- `POST /api/v1/verify` uses zero-hallucination verification kernel on tender clause vs evidence pack.
