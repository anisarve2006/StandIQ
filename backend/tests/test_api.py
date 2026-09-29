import os
import pytest
from fastapi.testclient import TestClient

# Ensure data directory exists
default_db = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "standards.db")
os.makedirs(os.path.dirname(default_db), exist_ok=True)
if not os.path.exists(default_db):
    from data_pipeline.load_database import init_sqlite_db
    init_sqlite_db(default_db)


from api_service import app, engine, session_repo
from retrieval.engine import StandardsRecommenderEngine
from retrieval.compiler import compile_query
from retrieval.verification_kernel import VerificationKernel

client = TestClient(app)

@pytest.fixture(autouse=True)
def inject_test_db(test_db_path):
    # Override engine singleton db path in api_service and locally
    engine.db_path = test_db_path
    engine.retriever.db_path = test_db_path
    engine.graph_expander.db_path = test_db_path
    engine.completeness_engine.db_path = test_db_path
    engine.verification_kernel = VerificationKernel(db_path=test_db_path)
    session_repo.set_db_path(test_db_path)
    # The hybrid search connection is requested at query time, so overriding db_path is sufficient

def test_healthcheck():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    # Should reflect synthetic DB records
    assert data["corpus_statistics"]["total_standards"] > 0

def test_query_compiler():
    query_text = "supply of tmt rebar Fe 500 for construction"
    compiled = compile_query(query_text)
    assert "FE 500" in str(compiled["constraints"])
    assert compiled["is_multilingual"] is False

def test_multilingual_compiler():
    query_text = "सरिया के लिए टेंडर"
    compiled = compile_query(query_text)
    # trade lexicon translates it to high strength deformed steel bars and wires
    assert "high strength deformed" in compiled["canonical_english"].lower()
    assert compiled["is_multilingual"] is True

def test_retrieval_and_recommendation():
    # Provide a query that matches IS:1786 in synthetic data
    response = client.post("/api/v1/recommend", json={"query": "rebar for construction", "top_candidates": 3})
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "SUCCESS"
    assert data["primary_recommendation"]["family_id"] == "IS:1786"
    
    # Certification should be detected from synthetic QCO
    cert = data["certification"]
    assert cert["is_mandatory"] is True
    assert "Scheme I" in cert["scheme"]

def test_verification_kernel(test_db_path):
    vk = VerificationKernel(db_path=test_db_path)
    
    # Test hallucinated IS number
    hallucinated_text = "Standard IS 99999 : 2024 is required."
    sanitized, violations, rate = vk.verify_existence(hallucinated_text)
    
    assert len(violations) > 0
    assert "INVALID CITATION REMOVED" in sanitized
    assert "99999" not in sanitized

    # Test valid IS number
    valid_text = "Standard IS 1786 is required."
    sanitized, violations, rate = vk.verify_existence(valid_text)
    
    assert len(violations) == 0
    assert "IS 1786" in sanitized
