import pytest
from schemas.domain import Requirement, RequirementCategory, ApplicabilityStatus, CertificationStatus
from services.applicability_service import ApplicabilityService
from services.tender_service import TenderService
from services.tender_health_service import TenderHealthService
from services.completeness_service import CompletenessService

def test_applicability_service():
    service = ApplicabilityService()
    req = Requirement(category=RequirementCategory.ELECTRICAL, name="Voltage", source_text="230V", normalized_value=230, unit="V")
    std = {"title_en": "Low Voltage Motor 230V", "status": "CURRENT"}
    
    result = service.evaluate_requirement(req, std)
    assert result.status == ApplicabilityStatus.SATISFIES

def test_tender_service():
    service = TenderService()
    text = "We need a 5 HP motor for 230V."
    result = service.analyze_text(text)
    assert len(result.clauses) == 1
    assert "230.0" in [c.value for c in result.clauses]

def test_tender_health_service():
    service = TenderHealthService()
    tender_service = TenderService()
    text = "Voltage is 230V\nVoltage is 415V"
    clauses = tender_service.analyze_text(text).clauses
    findings = service.analyze_health(clauses)
    assert len(findings) > 0
    assert "CONTRADICTION" in [f.category for f in findings]

def test_completeness_service():
    service = CompletenessService()
    coverage = {"facets": {"product": True, "testing": False}}
    constraints = {"voltage": {"value": 230}}
    result = service.get_completeness_report(coverage, constraints)
    assert "TESTING" in result.missing
    assert "PRODUCT" in result.covered
    # Grade and environment missing, should yield 2 questions
    assert len(result.clarifying_questions) == 2
