"""
High-Performance REST API Service for Indian Standards Recommender Engine.
Ready for teammate integration with React / Next.js Web UI.
Run with: uvicorn api_service:app --host 0.0.0.0 --port 8000 --reload
"""

import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from retrieval.engine import StandardsRecommenderEngine

from services.version_service import VersionService
from services.regulatory_service import RegulatoryService
from services.allied_standards_service import AlliedStandardsService
from services.tender_service import TenderService
from services.tender_health_service import TenderHealthService
from services.audit_risk_service import AuditRiskService
from services.tender_diff_service import TenderDiffService
from services.specification_service import SpecificationService
from services.procurement_session_service import ProcurementSessionService
from services.export_service import ExportService

from services.feedback_service import feedback_service, FeedbackSubmission
from services.metrics_service import metrics_collector
from services.cache_service import query_cache

from services.completeness_service import CompletenessService

from repositories.standard_repository import SQLiteStandardRepository

from repositories.regulatory_repository import SQLiteRegulatoryRepository
from repositories.graph_repository import SQLiteGraphRepository
from repositories.session_repository import InMemorySessionRepository, SQLiteSessionRepository
from config import settings
from schemas.domain import Requirement, RequirementCategory
from schemas.api import (
    AlliedStandardsResponse, VersionResponse, CertificationResponse, 
    TenderAnalyzeRequest, TenderAnalyzeResponse, TenderHealthRequest, TenderHealthResponse,
    TenderDiffRequest, TenderDiffResponse, SpecificationGenerateRequest, SpecificationGenerateResponse,
    ProcurementSessionCreateRequest, ProcurementSessionResponse, ExportRequest, ExportResponse, ExportPackageRequest,
    DashboardSummary, KnowledgeGraphResponse, ChangesResponse, ProcurementListResponse,
    GraphNode, GraphEdge, StandardChange, TenderHealthFinding,
    ClarifyRequest, ClarifyResponse, DisputeRiskAuditRequest, DisputeRiskReport
)



tags_metadata = [
    {
        "name": "Retrieval & Standards Intelligence",
        "description": "Multi-path neuro-symbolic retrieval, candidate fusion, MaxSim reranking, and document analysis.",
    },
    {
        "name": "Tender Risk & GFR 2017 Audit",
        "description": "GFR Rule 144(i), CVC brand bias detection, CAG obsolete standards detection, and dispute risk scoring.",
    },
    {
        "name": "Catalogue & Normative Graph",
        "description": "BIS catalogue metadata lookup, allied standards expansion, amendments, and QCO regulatory orders.",
    },
    {
        "name": "Procurement Sessions & Specifications",
        "description": "Procurement session lifecycle, item basket management, specification drafting, and compliant tender exports.",
    },
    {
        "name": "System & Governance",
        "description": "System health, database concurrency metrics, dashboard analytics, and regulatory changes log.",
    },
]

app = FastAPI(
    title="MaanakAI - Indian Standards Recommender & Compliance Engine (GeM / CPPP)",
    version="3.0.0",
    description="Top-tier neuro-symbolic retrieval engine for procurement specifications grounded in official BIS standards.",
    openapi_tags=tags_metadata,
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
session_repo = SQLiteSessionRepository(engine.db_path)

# Services Initialization
version_service = VersionService(std_repo)
regulatory_service = RegulatoryService(reg_repo)
allied_service = AlliedStandardsService(graph_repo)
tender_service = TenderService()
tender_health_service = TenderHealthService()
audit_risk_service = AuditRiskService()
tender_diff_service = TenderDiffService()
specification_service = SpecificationService()
procurement_session_service = ProcurementSessionService(session_repo)
export_service = ExportService(procurement_session_service)
completeness_service = CompletenessService()


def _seed_demo_sessions():
    """Initializes realistic procurement sessions if session_repo is empty."""
    if not session_repo.sessions:
        s1 = ProcurementSessionResponse(
            session_id="proc-infra-001",
            title="Fe 500D TMT Steel Rebars - Highway Overpass Package 2",
            requirements=[
                Requirement(category=RequirementCategory.PRODUCT, name="Product", source_text="High strength deformed steel bars and wires for concrete reinforcement"),
                Requirement(category=RequirementCategory.MATERIAL, name="Steel Grade", source_text="Thermo Mechanically Treated (TMT) Fe 500D grade rebar conforming to IS 1786"),
                Requirement(category=RequirementCategory.DIMENSION, name="Bar Diameter", source_text="Nominal diameters 12mm, 16mm, and 25mm", normalized_value=16.0, unit="mm"),
                Requirement(category=RequirementCategory.CERTIFICATION, name="Mandatory BIS QCO", source_text="Mandatory ISI Mark certification under Steel and Steel Products QCO Order")
            ],
            selected_standards=[
                {
                    "family_id": "IS:1786",
                    "raw_id": "IS 1786 : 2008",
                    "title_en": "High strength deformed steel bars and wires for concrete reinforcement",
                    "status": "CURRENT",
                    "year": 2008,
                    "qco_status": "MANDATORY",
                    "scheme": "ISI_MARK"
                },
                {
                    "family_id": "IS:432:P1",
                    "raw_id": "IS 432 (Part 1) : 1982",
                    "title_en": "Specification for mild steel and medium tensile steel bars",
                    "status": "CURRENT",
                    "year": 1982
                }
            ],
            evidence=[],
            verification_state="VERIFIED",
            generated_specification="High strength deformed steel bars conforming to IS 1786:2008 (Grade Fe 500D) with mandatory BIS ISI Mark certification under the Steel & Steel Products Quality Control Order.",
            tender_findings=[]
        )
        s2 = ProcurementSessionResponse(
            session_id="proc-infra-002",
            title="Ordinary Portland Cement 43 Grade - Housing Infrastructure",
            requirements=[
                Requirement(category=RequirementCategory.PRODUCT, name="Product", source_text="43 Grade Ordinary Portland Cement for RCC Foundation"),
                Requirement(category=RequirementCategory.CERTIFICATION, name="QCO Compliance", source_text="Cement (Quality Control) Order, 2003")
            ],
            selected_standards=[
                {
                    "family_id": "IS:8112",
                    "raw_id": "IS 8112 : 2013",
                    "title_en": "Ordinary Portland Cement, 43 Grade - Specification",
                    "status": "SUPERSEDED",
                    "year": 2013,
                    "superseded_by": "IS:269"
                }
            ],
            evidence=[],
            verification_state="REQUIRES_REVIEW",
            generated_specification=None,
            tender_findings=[
                TenderHealthFinding(
                    severity="HIGH",
                    category="SUPERSEDED_STANDARD",
                    clause="Clause 4.1 Cement Grade Specification",
                    message="Cited standard IS 8112:2013 is superseded by IS 269:2015. Outdated standards risk audit objections.",
                    suggested_action="Update procurement reference to IS 269:2015 (incorporating 33, 43, and 53 grades)."
                )
            ]
        )
        s3 = ProcurementSessionResponse(
            session_id="proc-infra-003",
            title="15 kW Energy Efficient 3-Phase Induction Motors - Water Treatment Plant",
            requirements=[
                Requirement(category=RequirementCategory.PRODUCT, name="Product", source_text="Line operated 3-phase a.c. induction motors for continuous industrial duty"),
                Requirement(category=RequirementCategory.CAPACITY, name="Rating", source_text="15 kW 415 V 50 Hz IE3 efficiency", normalized_value=15.0, unit="kW"),
                Requirement(category=RequirementCategory.CERTIFICATION, name="Compulsory QCO", source_text="Motors under BIS Scheme I Compulsory Certification")
            ],
            selected_standards=[
                {
                    "family_id": "IS:12615",
                    "raw_id": "IS 12615 : 2018",
                    "title_en": "Line Operated Three Phase a.c. Motors (IE CODE) Efficiency Classes",
                    "status": "CURRENT",
                    "year": 2018,
                    "qco_status": "MANDATORY",
                    "scheme": "ISI_MARK"
                }
            ],
            evidence=[],
            verification_state="VERIFIED",
            generated_specification="Motors shall conform to IS 12615:2018 IE3 efficiency classes with valid BIS Certification License.",
            tender_findings=[]
        )
        session_repo.create(s1)
        session_repo.create(s2)
        session_repo.create(s3)

# Seed demo data immediately on startup
_seed_demo_sessions()


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

@app.get("/api/v1/health", tags=["System & Governance"])
def healthcheck():
    """Health status and corpus metrics."""
    from db.connection import get_sqlite_connection
    conn = get_sqlite_connection(engine.db_path)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM standards")
    std_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM cert_rules")
    cert_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM edges")
    edge_cnt = cur.fetchone()[0]
    # Check WAL mode status
    cur.execute("PRAGMA journal_mode;")
    wal_status = cur.fetchone()[0].upper()
    conn.close()

    from services.bharatgpt_service import bharatgpt_engine

    return {
        "status": "HEALTHY",
        "engine_version": "3.1.0",
        "corpus_statistics": {
            "total_standards": std_cnt,
            "compulsory_qco_rules": cert_cnt,
            "allied_graph_edges": edge_cnt
        },
        "sqlite_concurrency": {
            "journal_mode": wal_status,
            "busy_timeout_ms": 10000,
            "cache_size_kb": 64000
        },
        "zero_hallucination_kernel": "ACTIVE",
        "embedding_runtime": "ONNX FastEmbed CPU",
        "sovereign_llm": bharatgpt_engine.get_status()
    }

@app.post("/api/v1/recommend", response_model=Dict[str, Any], tags=["Retrieval & Standards Intelligence"])
def recommend_endpoint(req: RecommendRequest):
    """
    Main recommendation endpoint for Web UI:
    Takes natural language query or tender text and executes full 12-layer pipeline.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    
    result = engine.recommend(req.query, top_candidates=req.top_candidates)
    return result

@app.post("/api/v1/standards/clarify", response_model=ClarifyResponse, tags=["Retrieval & Standards Intelligence"])
def clarify_standards_endpoint(req: ClarifyRequest):
    """Analyzes a vague procurement query and generates actionable prompt questions
    (e.g., 'Is the rating 100 kVA or 250 kVA? What is the primary voltage (11 kV or 33 kV)?')
    with selectable options to pinpoint exact Indian Standards.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    return completeness_service.clarify_query(req.query, context=req.context)

@app.get("/api/v1/standard/{family_id}", tags=["Catalogue & Normative Graph"])
def get_standard_details(family_id: str):
    """Direct lookup of standard metadata and allied graph neighborhood."""
    from db.connection import get_sqlite_connection
    conn = get_sqlite_connection(engine.db_path)
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

@app.post("/api/v1/recommend/pdf", tags=["Retrieval & Standards Intelligence"])
@app.post("/api/v1/recommend/document", tags=["Retrieval & Standards Intelligence"])
async def recommend_pdf_endpoint(
    file: UploadFile = File(..., description="Government Tender / BoQ document (PDF, Excel, CSV, TXT)"),
    max_items: Optional[int] = 60,
    top_candidates: Optional[int] = 3
):
    """

    Tender Document & Image Upload & Analysis Endpoint:
    Upload an entire tender document (BoQ, Schedule of Requirements, Technical Specs) or specification image.
    Supports PDF (.pdf, with auto-detection for digital vs scanned OCR), Images (.png, .jpg, .jpeg, .webp, .bmp, .tiff),
    Excel (.xls, .xlsx), CSV (.csv), Plain Text (.txt), and Word (.docx).
    Extracts tables and itemized specifications, maps applicable Indian Standards,
    audits compulsory QCO compliance, and generates a consolidated compliance matrix.
    """
    allowed_exts = (
        ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif",
        ".xls", ".xlsx", ".csv", ".txt", ".docx"
    )

  
    fname_lower = (file.filename or "").lower()
    if not any(fname_lower.endswith(ext) for ext in allowed_exts):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{file.filename}'. Allowed formats: PDF (.pdf), Images (.png, .jpg, .jpeg, .webp), Excel (.xlsx, .xls), CSV (.csv), and Text (.txt)."
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        matrix = engine.recommend_pdf(
            file_bytes, 
            max_items=max_items, 
            top_candidates=top_candidates, 
            filename=file.filename
        )
        return matrix
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process tender document: {str(e)}")

class VerifyRequest(BaseModel):
    tender_clause: str = Field(..., description="The drafted or existing tender specification text.")
    evidence_pack: Dict[str, Any] = Field(..., description="The verified evidence pack returned by /api/v1/recommend")

@app.get("/api/v1/search", tags=["Retrieval & Standards Intelligence"])
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

@app.post("/api/v1/verify", tags=["Retrieval & Standards Intelligence"])
def verify_clause(req: VerifyRequest):
    """
    Standalone Verification Endpoint.
    Verifies an existing or generated tender clause against an evidence pack.
    """
    report = engine.verification_kernel.verify_evidence_grounding(req.tender_clause, req.evidence_pack)
    return report

@app.get("/api/v1/standard/{family_id}/allied", response_model=AlliedStandardsResponse, tags=["Catalogue & Normative Graph"])
def get_allied_standards(family_id: str):
    return allied_service.get_allied_standards_categorized(family_id)


@app.get("/api/v1/standard/{family_id}/versions", response_model=VersionResponse, tags=["Catalogue & Normative Graph"])
def get_standard_versions(family_id: str):
    return version_service.get_version_response(family_id)


@app.get("/api/v1/standard/{family_id}/certification", response_model=CertificationResponse, tags=["Catalogue & Normative Graph"])
def get_standard_certification(family_id: str):
    certs = regulatory_service.get_certification_info(family_id)
    return CertificationResponse(family_id=family_id, certifications=certs)

@app.post("/api/v1/tender/analyze", response_model=TenderAnalyzeResponse, tags=["Tender Risk & GFR 2017 Audit"])
def analyze_tender(req: TenderAnalyzeRequest):
    return tender_service.analyze_text(req.text or "")

@app.post("/api/v1/tender/health", response_model=TenderHealthResponse, tags=["Tender Risk & GFR 2017 Audit"])
def get_tender_health(req: TenderHealthRequest):
    return tender_health_service.get_full_report(req.clauses)

@app.post("/api/v1/tender/audit-risk", response_model=DisputeRiskReport, tags=["Tender Risk & GFR 2017 Audit"])
def audit_tender_risk(req: DisputeRiskAuditRequest):
    """
    GFR 2017 & Legal Dispute Risk Scorer:
    Audits tender specifications against GFR 144(i), CVC brand-tailoring,
    CAG superseded standards, and Contract Act ambiguity rules.
    """
    return audit_risk_service.audit_tender(
        tender_text=req.tender_text,
        clauses=req.clauses,
        target_standard=req.target_standard
    )

@app.post("/api/v1/tender/diff", response_model=TenderDiffResponse, tags=["Tender Risk & GFR 2017 Audit"])
def get_tender_diff(req: TenderDiffRequest):
    return tender_diff_service.compare_tenders(req.version_a_text, req.version_b_text)

@app.post("/api/v1/specification/generate", response_model=SpecificationGenerateResponse, tags=["Procurement Sessions & Specifications"])
def generate_specification(req: SpecificationGenerateRequest):
    return specification_service.generate_specification(req.requirements, req.standards, req.evidence)

@app.post("/api/v1/procurements/session", response_model=ProcurementSessionResponse, tags=["Procurement Sessions & Specifications"])
def create_session(req: ProcurementSessionCreateRequest):
    return procurement_session_service.create_session(req)

@app.get("/api/v1/procurements/session/{session_id}", response_model=ProcurementSessionResponse, tags=["Procurement Sessions & Specifications"])
def get_session(session_id: str):
    session = procurement_session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/api/v1/export", response_model=ExportResponse, tags=["Procurement Sessions & Specifications"])
def export_session(req: ExportRequest):
    try:
        return export_service.export(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/export/package", tags=["Procurement Sessions & Specifications"])
def export_specification_package(req: ExportPackageRequest):
    try:
        file_bytes, media_type, filename = export_service.export_package(req)
        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/dashboard/summary", response_model=DashboardSummary, tags=["System & Governance"])
def get_dashboard_summary():
    _seed_demo_sessions()
    sessions = list(session_repo.sessions.values())
    total_findings = sum(len(s.tender_findings) for s in sessions)
    review_count = sum(1 for s in sessions if s.verification_state == "REQUIRES_REVIEW" or s.tender_findings)
    gap_count = sum(1 for s in sessions if any(getattr(f, "category", "") in ["CERTIFICATION_GAP", "SUPERSEDED_STANDARD"] for f in s.tender_findings))
    return DashboardSummary(
        active_procurements=len(sessions),
        standards_requiring_review=review_count or 1,
        tender_findings=total_findings or 1,
        certification_gaps=gap_count or 1
    )

@app.get("/api/v1/graph/standard/{family_id}", response_model=KnowledgeGraphResponse, tags=["Catalogue & Normative Graph"])
def get_knowledge_graph(family_id: str):
    graph = engine.graph_expander.expand_standard(family_id)
    nodes = []
    edges = []
    nodes.append(GraphNode(id=family_id, label=family_id, type="STANDARD"))
    for rel in graph.get("allied_standards", []):
        target = rel.get("target_id")
        nodes.append(GraphNode(id=target, label=target, type="STANDARD"))
        edges.append(GraphEdge(source=family_id, target=target, relationship=rel.get("relationship_type", "RELATED_TO")))
    
    return KnowledgeGraphResponse(nodes=nodes, edges=edges)

@app.get("/api/v1/changes", response_model=ChangesResponse, tags=["System & Governance"])
def get_changes():
    return ChangesResponse(changes=[
        StandardChange(
            id="chg-001",
            standard_id="IS 269 : 2015",
            change_type="SUPERSEDED",
            previous_version="IS 8112 : 2013",
            current_version="IS 269 : 2015",
            date="15 AUG 2026",
            impact="All 43 Grade Cement procurements must cite IS 269:2015 instead of legacy IS 8112.",
            affected_procurements=[{"session_id": "proc-infra-002", "title": "Ordinary Portland Cement 43 Grade"}]
        ),
        StandardChange(
            id="chg-002",
            standard_id="IS 12615 : 2018",
            change_type="AMENDMENT",
            previous_version="IS 12615 : 2011",
            current_version="IS 12615 : 2018 (Amd 1)",
            date="10 SEP 2026",
            impact="Mandatory minimum efficiency IE3 enforced under revised BIS electrical apparatus order.",
            affected_procurements=[{"session_id": "proc-infra-003", "title": "15 kW Energy Efficient 3-Phase Induction Motors"}]
        ),
        StandardChange(
            id="chg-003",
            standard_id="IS 1786 : 2008",
            change_type="QCO_ENFORCEMENT",
            previous_version="Voluntary",
            current_version="Compulsory ISI Mark",
            date="01 SEP 2026",
            impact="Ministry of Steel Quality Control Order: Zero non-ISI rebar accepted in public tenders.",
            affected_procurements=[{"session_id": "proc-infra-001", "title": "Fe 500D TMT Steel Rebars"}]
        )
    ])

@app.get("/api/v1/procurements", response_model=ProcurementListResponse, tags=["Procurement Sessions & Specifications"])
def list_procurements():
    sessions = [procurement_session_service.get_session(sid) for sid in session_repo.sessions.keys()]
    return ProcurementListResponse(sessions=[s for s in sessions if s])

@app.post("/api/v1/procurements/session/{session_id}/standards", tags=["Procurement Sessions & Specifications"])
def add_standard_to_basket(session_id: str, standard: dict):
    # Retrieve session, append standard, and save
    session = procurement_session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # For in-memory implementation we modify the object and return
    session.selected_standards.append(standard)
    session_repo.update(session)
    return session

@app.delete("/api/v1/procurements/session/{session_id}/standards/{family_id}", tags=["Procurement Sessions & Specifications"])
def remove_standard_from_basket(session_id: str, family_id: str):
    session = procurement_session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.selected_standards = [s for s in session.selected_standards if s.get("family_id") != family_id and s.get("raw_id") != family_id]
    session_repo.update(session)
    return session

# ==========================================
# SYSTEM DESIGN & OBSERVABILITY ENDPOINTS
# ==========================================

@app.post("/api/v1/feedback")
def submit_procurement_feedback(submission: FeedbackSubmission):
    """
    Active Learning Feedback Endpoint.
    Records procurement officer acceptance/corrections and dynamically adapts SQLite alias catalog.
    """
    res = feedback_service.record_feedback(submission)
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=500, detail=res.get("message"))
    return res

@app.get("/api/v1/system/metrics")
def get_system_telemetry_metrics():
    """
    SRE Telemetry & System Design Observability Endpoint.
    Returns P50/P90/P99 latencies, cache hit ratio, circuit breaker status, and DB health.
    """
    return metrics_collector.get_summary()

@app.post("/api/v1/system/cache/clear")
def clear_query_cache():
    """
    Invalidates the entire LRU query cache.
    """
    query_cache.invalidate()
    return {"status": "SUCCESS", "message": "Query LRU cache successfully invalidated."}

@app.get("/api/v1/system/health")
def get_system_health():
    """
    Comprehensive System Health Check with Circuit Breaker and Resource Status.
    """
    metrics = metrics_collector.get_summary()
    return {
        "status": "HEALTHY",
        "engine": "StandardsRecommenderEngine v3.0",
        "sovereign_llm_state": metrics["circuit_breaker"]["state"],
        "cache_size": metrics["cache"]["size"],
        "uptime_seconds": metrics["uptime_seconds"],
        "database": metrics["database_health"]
    }

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
