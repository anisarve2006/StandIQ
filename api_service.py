"""
High-Performance REST API Service for Indian Standards Recommender Engine.
Ready for teammate integration with React / Next.js Web UI.
Run with: uvicorn api_service:app --host 0.0.0.0 --port 8000 --reload
"""

import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from retrieval.engine import StandardsRecommenderEngine

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
