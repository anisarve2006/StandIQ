import pytest
from fastapi.testclient import TestClient
from api_service import app

client = TestClient(app)

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "active_procurements" in data
    assert "standards_requiring_review" in data
    assert "tender_findings" in data
    assert "certification_gaps" in data

def test_knowledge_graph():
    response = client.get("/api/v1/graph/standard/IS 13947")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data

def test_changes():
    response = client.get("/api/v1/changes")
    assert response.status_code == 200
    data = response.json()
    assert "changes" in data

def test_procurements():
    response = client.get("/api/v1/procurements")
    assert response.status_code == 200
    data = response.json()
    assert "sessions" in data

def test_basket_mutations():
    # Create a session
    response = client.post("/api/v1/procurements/session", json={"title": "Test Session"})
    assert response.status_code == 200
    session_id = response.json()["session_id"]

    # Add standard to basket
    standard = {"family_id": "IS 123", "raw_id": "IS 123", "title": "Test Standard"}
    response = client.post(f"/api/v1/procurements/session/{session_id}/standards", json=standard)
    assert response.status_code == 200
    data = response.json()
    assert len(data["selected_standards"]) > 0
    assert data["selected_standards"][-1]["family_id"] == "IS 123"

    # Delete standard from basket
    response = client.delete(f"/api/v1/procurements/session/{session_id}/standards/IS 123")
    assert response.status_code == 200
    data = response.json()
    assert not any(s["family_id"] == "IS 123" for s in data["selected_standards"])
