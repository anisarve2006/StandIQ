"""
High-Performance REST API Service for Indian Standards Recommender Engine.
Ready for teammate integration with React / Next.js Web UI.
Run with: uvicorn api_service:app --host 0.0.0.0 --port 8000 --reload
"""

import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from retrieval.engine import StandardsRecommenderEngine

from services.version_service import VersionService
from services.regulatory_service import RegulatoryService
from services.allied_standards_service import AlliedStandardsService
from services.tender_service import TenderService
from services.tender_health_service import TenderHealthService
from services.tender_diff_service import TenderDiffService
from services.specification_service import SpecificationService
from services.procurement_session_service import ProcurementSessionService
from services.export_service import ExportService
from repositories.standard_repository import SQLiteStandardRepository
from repositories.regulatory_repository import SQLiteRegulatoryRepository
from repositories.graph_repository import SQLiteGraphRepository
from repositories.session_repository import InMemorySessionRepository
from config import settings
from schemas.api import (
    AlliedStandardsResponse, VersionResponse, CertificationResponse, 
    TenderAnalyzeRequest, TenderAnalyzeResponse, TenderHealthRequest, TenderHealthResponse,
    TenderDiffRequest, TenderDiffResponse, SpecificationGenerateRequest, SpecificationGenerateResponse,
    ProcurementSessionCreateRequest, ProcurementSessionResponse, ExportRequest, ExportResponse
)


app = FastAPI(
    title="Indian Standards Recommender & Compliance Engine (GeM / CPPP)",
    version="3.0.0",
    description="Top-tier neuro-symbolic retrieval engine for procurement specifications grounded in official BIS standards."
)

# Enable CORS for Next.js / React frontend teammates
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engine singleton
engine = StandardsRecommenderEngine()

# Repositories Initialization
std_repo = SQLiteStandardRepository(engine.db_path)
reg_repo = SQLiteRegulatoryRepository(engine.db_path)
graph_repo = SQLiteGraphRepository(engine.db_path)
session_repo = InMemorySessionRepository()

# Services Initialization
version_service = VersionService(std_repo)
regulatory_service = RegulatoryService(reg_repo)
allied_service = AlliedStandardsService(graph_repo)
tender_service = TenderService()
tender_health_service = TenderHealthService()
tender_diff_service = TenderDiffService()
specification_service = SpecificationService()
procurement_session_service = ProcurementSessionService(session_repo)
export_service = ExportService(procurement_session_service)


# Request & Response Models
class RecommendRequest(BaseModel):
    query: str = Field(..., description="Procurement text, BOQ description, technical parameters, or Indian standard citation.")
    top_candidates: Optional[int] = Field(default=5, ge=1, le=15, description="Number of candidate standards to return.")

class RecommendResponse(BaseModel):
    status: str
    query: str
    primary_recommendation: Dict[str, Any]
    allied_standards: Dict[str, List[Dict[str, Any]]]
    certification: Dict[str, Any]
    specification_clause: str
    specification_gaps: List[str]
    verification_audit: Dict[str, Any]
    alternative_candidates: List[Dict[str, Any]]
    latency_breakdown_ms: Dict[str, float]

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred processing your request.",
                "details": str(exc) if settings.use_groq else None # Don't expose unless debug/configured
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "UNPROCESSABLE_ENTITY",
                "message": "The request payload is invalid.",
                "details": exc.errors()
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )

@app.get("/api/v1/health")
def healthcheck():
    """Health status and corpus metrics."""
    import sqlite3
    conn = sqlite3.connect(engine.db_path)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM standards")
    std_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM cert_rules")
    cert_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM edges")
    edge_cnt = cur.fetchone()[0]
    conn.close()

    return {
        "status": "HEALTHY",
        "engine_version": "3.0.0",
        "corpus_statistics": {
            "total_standards": std_cnt,
            "compulsory_qco_rules": cert_cnt,
            "allied_graph_edges": edge_cnt
        },
        "zero_hallucination_kernel": "ACTIVE",
        "embedding_runtime": "ONNX FastEmbed CPU"
    }

@app.post("/api/v1/recommend", response_model=Dict[str, Any])
def recommend_endpoint(req: RecommendRequest):
    """
    Main recommendation endpoint for Web UI:
    Takes natural language query or tender text and executes full 12-layer pipeline.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    
    result = engine.recommend(req.query, top_candidates=req.top_candidates)
    return result

@app.get("/api/v1/standard/{family_id}")
def get_standard_details(family_id: str):
    """Direct lookup of standard metadata and allied graph neighborhood."""
    import sqlite3
    conn = sqlite3.connect(engine.db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM standards WHERE family_id = ? OR number = ? LIMIT 1", (family_id, family_id))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Standard {family_id} not found in official catalogue.")
    
    std = dict(row)
    conn.close()

    graph = engine.graph_expander.expand_standard(std["family_id"])
    return {
        "standard": std,
        "allied_graph": graph["allied_standards"],
        "certification": graph["certification"]
    }

@app.post("/api/v1/recommend/pdf")
async def recommend_pdf_endpoint(
    file: UploadFile = File(..., description="Government Tender / BoQ PDF document"),
    max_items: Optional[int] = 10,
    top_candidates: Optional[int] = 3
):
    """
    Tender PDF Upload & Analysis Endpoint:
    Upload an entire tender PDF (BoQ, Schedule of Requirements, Technical Specs).
    Extracts tables and itemized specifications, maps applicable Indian Standards,
    audits compulsory QCO compliance, and generates a consolidated compliance matrix.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF documents are supported.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")

    try:
        matrix = engine.recommend_pdf(pdf_bytes, max_items=max_items, top_candidates=top_candidates)
        return matrix
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process tender PDF: {str(e)}")

class VerifyRequest(BaseModel):
    tender_clause: str = Field(..., description="The drafted or existing tender specification text.")
    evidence_pack: Dict[str, Any] = Field(..., description="The verified evidence pack returned by /api/v1/recommend")

@app.get("/api/v1/search")
def global_search(q: str, limit: int = 10):
    """
    Fast, generic global search for standards bypassing the full recommendation loop.
    Uses multi-tier lexical + semantic search if needed.
    """
    if not q.strip():
        return []
    
    from retrieval.compiler import compile_query
    query_obj = compile_query(q)
    results = engine.retriever.retrieve(query_obj, top_n=limit)
    
    # Strip heavy fields for generic search
    clean_results = []
    for r in results:
        clean_results.append({
            "family_id": r.get("family_id"),
            "raw_id": r.get("raw_id"),
            "title_en": r.get("title_en"),
            "status": r.get("status"),
            "year": r.get("year"),
            "score": r.get("rrf_score")
        })
    return {"results": clean_results}

@app.post("/api/v1/verify")
def verify_clause(req: VerifyRequest):
    """
    Standalone Verification Endpoint.
    Verifies an existing or generated tender clause against an evidence pack.
    """
    report = engine.verification_kernel.verify_evidence_grounding(req.tender_clause, req.evidence_pack)
    return report

@app.get("/api/v1/standard/{family_id}/allied", response_model=AlliedStandardsResponse)
def get_allied_standards(family_id: str):
    allied = allied_service.get_allied_standards(family_id)
    return AlliedStandardsResponse(family_id=family_id, allied_standards=allied)

@app.get("/api/v1/standard/{family_id}/versions", response_model=VersionResponse)
def get_standard_versions(family_id: str):
    v_info = version_service.get_version_info(family_id)
    return VersionResponse(family_id=family_id, version_info=v_info)

@app.get("/api/v1/standard/{family_id}/certification", response_model=CertificationResponse)
def get_standard_certification(family_id: str):
    certs = regulatory_service.get_certification_info(family_id)
    return CertificationResponse(family_id=family_id, certifications=certs)

@app.post("/api/v1/tender/analyze", response_model=TenderAnalyzeResponse)
def analyze_tender(req: TenderAnalyzeRequest):
    return tender_service.analyze_text(req.text or "")

@app.post("/api/v1/tender/health", response_model=TenderHealthResponse)
def get_tender_health(req: TenderHealthRequest):
    findings = tender_health_service.analyze_health(req.clauses)
    return TenderHealthResponse(findings=findings)

@app.post("/api/v1/tender/diff", response_model=TenderDiffResponse)
def get_tender_diff(req: TenderDiffRequest):
    return tender_diff_service.compare_tenders(req.version_a_text, req.version_b_text)

@app.post("/api/v1/specification/generate", response_model=SpecificationGenerateResponse)
def generate_specification(req: SpecificationGenerateRequest):
    return specification_service.generate_specification(req.requirements, req.standards, req.evidence)

@app.post("/api/v1/procurements/session", response_model=ProcurementSessionResponse)
def create_session(req: ProcurementSessionCreateRequest):
    return procurement_session_service.create_session(req)

@app.get("/api/v1/procurements/session/{session_id}", response_model=ProcurementSessionResponse)
def get_session(session_id: str):
    session = procurement_session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/api/v1/export", response_model=ExportResponse)
def export_session(req: ExportRequest):
    try:
        return export_service.export(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Python direct callables for internal scripts / teammates
def recommend_standards(query_text: str, top_candidates: int = 5) -> Dict[str, Any]:
    """Clean Python API for direct teammate imports (single text query)."""
    return engine.recommend(query_text, top_candidates=top_candidates)

def recommend_tender_pdf(pdf_input: Any, max_items: int = 10, top_candidates: int = 3) -> Dict[str, Any]:
    """Clean Python API for direct teammate imports (Tender PDF file path or bytes)."""
    return engine.recommend_pdf(pdf_input, max_items=max_items, top_candidates=top_candidates)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_service:app", host="0.0.0.0", port=8000, reload=True)
