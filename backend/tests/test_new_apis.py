import pytest
from fastapi.testclient import TestClient
from api_service import app

client = TestClient(app)

def test_tender_health_api():
    response = client.post("/api/v1/tender/health", json={
        "clauses": [
            {
                "text": "Voltage is 230V",
                "requirement": "voltage",
                "value": "230"
            },
            {
                "text": "Voltage is 415V",
                "requirement": "voltage",
                "value": "415"
            }
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "findings" in data
    assert len(data["findings"]) > 0
    assert any(f["category"] == "CONTRADICTION" for f in data["findings"])

def test_specification_generate_api():
    response = client.post("/api/v1/specification/generate", json={
        "requirements": [
            {
                "category": "ELECTRICAL",
                "name": "voltage",
                "source_text": "230V",
                "normalized_value": 230,
                "unit": "V"
            }
        ],
        "standards": [{"family_id": "IS:123"}],
        "evidence": []
    })
    assert response.status_code == 200
    data = response.json()
    assert "specification_clause" in data
    assert "230" in data["specification_clause"]
    assert "IS:123" in data["specification_clause"]

def test_procurement_session_api():
    # Create
    response = client.post("/api/v1/procurements/session", json={"title": "Test Session"})
    assert response.status_code == 200
    data = response.json()
    session_id = data["session_id"]
    assert data["title"] == "Test Session"

    # Get
    response = client.get(f"/api/v1/procurements/session/{session_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Session"

    # Export
    response = client.post("/api/v1/export", json={"session_id": session_id, "format": "markdown"})
    assert response.status_code == 200
    assert "text/markdown" in response.json()["content_type"]
