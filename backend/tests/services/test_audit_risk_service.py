import pytest
from services.audit_risk_service import AuditRiskService
from services.tender_health_service import TenderHealthService
from schemas.api import TenderClauseDetail


def test_audit_risk_clean_compliant_tender():
    service = AuditRiskService()
    text = (
        "Procurement of High strength deformed steel bars Grade Fe 500D conforming to IS 1786:2008. "
        "Material shall carry mandatory BIS ISI Mark in compliance with Steel and Steel Products Quality Control Order. "
        "Manufacturer Test Certificate (MTC) as per IS 1608 must be furnished with pre-dispatch sampling by NABL accredited lab."
    )
    report = service.audit_tender(tender_text=text)
    assert report.total_risk_score <= 20
    assert report.risk_tier == "SAFE"
    assert report.compliance_certificate_id.startswith("GFR-AUDIT-")
    assert len(report.findings) == 0


def test_audit_risk_cvc_brand_bias():
    service = AuditRiskService()
    text = "Supply of TMT steel rebar. Make: Tata Tiscon or Jindal only. Other makes will be rejected."
    report = service.audit_tender(tender_text=text)
    assert report.dimension_scores["cvc"] >= 20
    assert any(f.dimension == "CVC_COMPETITION" for f in report.findings)
    assert any("Tata" in f.issue or "Tiscon" in f.issue for f in report.findings)


def test_audit_risk_cag_superseded_standard():
    service = AuditRiskService()
    text = "Procurement of 43 Grade Ordinary Portland Cement conforming to IS 8112:2013 with ISI mark."
    report = service.audit_tender(tender_text=text)
    assert report.dimension_scores["cag"] >= 20
    assert any(f.dimension == "CAG_AUDIT" for f in report.findings)
    assert "IS 269:2015" in report.remediated_specification


def test_audit_risk_arbitration_vague_and_conflicting():
    service = AuditRiskService()
    text = (
        "Supply of best quality electric motor. Rated for 415V continuous duty. "
        "Control panel rating 230V without separate transformer. Must be heavy duty superior make."
    )
    report = service.audit_tender(tender_text=text)
    assert report.dimension_scores["arbitration"] > 0
    assert any(f.dimension == "ARBITRATION_TRAP" for f in report.findings)


def test_tender_health_full_report_integration():
    health_service = TenderHealthService()
    clauses = [
        TenderClauseDetail(id="c1", text="Supply of 43 grade cement conforming to IS 8112:2013", requirement="product"),
        TenderClauseDetail(id="c2", text="Make: UltraTech only", requirement="brand")
    ]
    resp = health_service.get_full_report(clauses)
    assert resp.dispute_risk_report is not None
    assert resp.dispute_risk_report.total_risk_score > 30
