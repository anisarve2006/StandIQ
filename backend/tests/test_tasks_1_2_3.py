"""
Test Suite for Task 1, Task 2, and Task 3 implementations.
Validates:
1. Task 1: Allied Standards Categorization into the 5 core problem statement categories:
   - NORMATIVE_REFERENCE
   - TEST_METHOD
   - SAFETY_CODE
   - INSTALLATION_CODE
   - TERMINOLOGY_GLOSSARY
2. Task 2: Version Diff and Amendment tracking:
   - Amendment dates, notifications, and clause-level change diffs.
3. Task 3: Query Clarification with actionable prompts for ambiguous requirements:
   - Actionable questions (e.g. kVA rating, voltage, diameter, grade).
"""

import pytest
from fastapi.testclient import TestClient
from api_service import app

client = TestClient(app)


def test_task1_allied_standards_5_categories():
    """Verify GET /api/v1/standard/{family_id}/allied returns the 5 Problem Statement categories."""
    response = client.get("/api/v1/standard/IS:1786/allied")
    assert response.status_code == 200
    data = response.json()

    assert data["family_id"] == "IS:1786"
    assert "categories" in data
    cats = data["categories"]

    # Verify all 5 categories are present as lists
    for cat_name in [
        "normative_references",
        "test_methods",
        "safety_codes",
        "installation_codes",
        "terminology_glossaries"
    ]:
        assert cat_name in cats
        assert isinstance(cats[cat_name], list)

    # For IS:1786, we should have normative references, test methods, and installation codes
    assert len(cats["test_methods"]) > 0
    test_std_ids = [item["standard_id"] for item in cats["test_methods"]]
    assert any("1608" in fid for fid in test_std_ids)  # IS 1608 tensile test

    # Verify backwards compatibility field exists
    assert "allied_standards" in data
    assert len(data["allied_standards"]) > 0


def test_task2_version_diff_and_amendments():
    """Verify GET /api/v1/standard/{family_id}/versions returns amendments and version diffs."""
    response = client.get("/api/v1/standard/IS:1786/versions")
    assert response.status_code == 200
    data = response.json()

    assert data["family_id"] == "IS:1786"
    assert "version_diff" in data
    vdiff = data["version_diff"]
    assert "chronological_amendments" in vdiff
    assert len(vdiff["chronological_amendments"]) >= 1

    # Check amendment metadata
    amd1 = vdiff["chronological_amendments"][0]
    assert "amendment_no" in amd1
    assert "notification_date" in amd1
    assert "change_summary" in amd1

    # Check diff summary
    assert "diff_summary" in vdiff
    assert len(vdiff["diff_summary"]) > 0


def test_task3_clarify_ambiguous_query():
    """Verify POST /api/v1/standards/clarify produces actionable prompts for vague queries."""
    # Vague query: Distribution Transformer
    response = client.post("/api/v1/standards/clarify", json={
        "query": "Distribution Transformer"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["is_ambiguous"] is True
    assert "clarifying_questions" in data
    assert len(data["clarifying_questions"]) >= 2
    param_names = [q["parameter"] for q in data["clarifying_questions"]]
    assert any("kva" in p.lower() or "rating" in p.lower() for p in param_names)
    assert any("voltage" in p.lower() for p in param_names)


def test_task3_clarify_specific_query():
    """Verify POST /api/v1/standards/clarify passes specific queries without unnecessary questions."""
    response = client.post("/api/v1/standards/clarify", json={
        "query": "100 kVA 11 kV outdoor distribution transformer IS 1180 copper wound"
    })
    assert response.status_code == 200
    data = response.json()

    # Highly specific query should have low or zero ambiguity
    assert "clarifying_questions" in data
    assert len(data["clarifying_questions"]) <= 1
