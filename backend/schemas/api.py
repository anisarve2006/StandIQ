from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from schemas.domain import VersionInfo, CertificationInfo, Requirement, ApplicabilityResult, VersionDiffInfo, AmendmentRecord

class AlliedStandardResponse(BaseModel):

    source_standard: str
    relationship: str
    target_standard: str
    reason: Optional[str] = None
    evidence: Optional[str] = None

class AlliedStandardItem(BaseModel):
    standard_id: str
    title: Optional[str] = None
    relationship: str
    provenance: Optional[str] = None
    year: Optional[int] = None
    status: Optional[str] = None

class CategorizedAlliedStandards(BaseModel):
    normative_references: List[AlliedStandardItem] = []
    test_methods: List[AlliedStandardItem] = []
    safety_codes: List[AlliedStandardItem] = []
    installation_codes: List[AlliedStandardItem] = []
    terminology_glossaries: List[AlliedStandardItem] = []

class AlliedStandardsResponse(BaseModel):
    family_id: str
    categories: CategorizedAlliedStandards = CategorizedAlliedStandards()
    allied_standards: List[AlliedStandardResponse] = []


class VersionResponse(BaseModel):
    family_id: str
    version_info: VersionInfo
    version_diff: Optional[VersionDiffInfo] = None


class CertificationResponse(BaseModel):
    family_id: str
    certifications: List[CertificationInfo]

class TenderAnalyzeRequest(BaseModel):
    text: Optional[str] = None

class TenderClauseDetail(BaseModel):
    clause_id: Optional[str] = None
    text: str
    product: Optional[str] = None
    requirement: Optional[str] = None
    value: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    mandatory: bool = True
    referenced_standard: Optional[str] = None
    source_location: Optional[str] = None

class TenderAnalyzeResponse(BaseModel):
    clauses: List[TenderClauseDetail]
    recommendations: Dict[str, Any]

class AuditVulnerabilityFinding(BaseModel):
    id: str
    dimension: str  # "GFR_144_I", "CVC_COMPETITION", "CAG_AUDIT", "ARBITRATION_TRAP"
    dimension_title: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    clause_text: str
    rule_reference: str
    issue: str
    consequence: str
    remediation: str
    risk_points: Optional[int] = 0

class DisputeRiskReport(BaseModel):
    total_risk_score: int  # 0 to 100
    risk_tier: str  # "SAFE", "LOW", "MODERATE", "HIGH", "CRITICAL"
    summary: str
    dimension_scores: Dict[str, int]  # {"gfr": int, "cvc": int, "cag": int, "arbitration": int}
    dimension_max_scores: Optional[Dict[str, int]] = None  # Dynamic maximums (sum to 100)
    commodity_criticality: Optional[str] = None  # e.g. "TIER_1_STRUCTURAL_SAFETY"
    findings: List[AuditVulnerabilityFinding]
    remediated_specification: Optional[str] = None
    compliance_certificate_id: Optional[str] = None

class DisputeRiskAuditRequest(BaseModel):
    tender_text: Optional[str] = None
    clauses: Optional[List[str]] = []
    target_standard: Optional[str] = None

class TenderHealthFinding(BaseModel):
    severity: str
    category: str
    clause: str
    message: str
    suggested_action: str

class TenderHealthRequest(BaseModel):
    clauses: List[TenderClauseDetail]

class TenderHealthResponse(BaseModel):
    findings: List[TenderHealthFinding]
    dispute_risk_report: Optional[DisputeRiskReport] = None

class TenderDiffRequest(BaseModel):
    version_a_text: str
    version_b_text: str

class TenderDiffResponse(BaseModel):
    added_clauses: List[str]
    removed_clauses: List[str]
    modified_clauses: List[Dict[str, str]]
    changed_technical_values: List[Dict[str, Any]]
    changed_standards: List[Dict[str, str]]

class CompletenessResponse(BaseModel):
    covered: List[str]
    partial: List[str]
    missing: List[str]
    clarifying_questions: List[str]

class SpecificationGenerateRequest(BaseModel):
    requirements: List[Requirement]
    standards: List[Dict[str, Any]]
    evidence: List[Dict[str, Any]]

class SpecificationGenerateResponse(BaseModel):
    specification_clause: str

class ProcurementSessionCreateRequest(BaseModel):
    title: str

class ProcurementSessionResponse(BaseModel):
    session_id: str
    title: str
    requirements: List[Requirement]
    selected_standards: List[Dict[str, Any]]
    evidence: List[Dict[str, Any]]
    verification_state: str
    generated_specification: Optional[str] = None
    tender_findings: List[TenderHealthFinding]

class ExportRequest(BaseModel):
    session_id: str
    format: str

class ExportResponse(BaseModel):
    content: str
    content_type: str

class SpecificationPackageStandard(BaseModel):
    id: Optional[str] = None
    code: str
    title: str
    type: Optional[str] = "Product"
    status: Optional[str] = "Current"
    year: Optional[int] = None
    reaffirmedYear: Optional[int] = None
    mandatory: Optional[bool] = False
    tags: Optional[List[str]] = []

class ExportPackageRequest(BaseModel):
    file_name: str
    format: str = "pdf"
    sections: List[str] = []
    standards: List[SpecificationPackageStandard] = []
    title: Optional[str] = "Indian Standards Specification Package"


class DashboardSummary(BaseModel):
    active_procurements: int
    standards_requiring_review: int
    tender_findings: int
    certification_gaps: int

class GraphNode(BaseModel):
    id: str
    label: str
    type: str

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str

class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class StandardChange(BaseModel):
    id: str
    standard_id: str
    change_type: str
    previous_version: str
    current_version: str
    date: str
    impact: str
    affected_procurements: List[Dict[str, str]]

class ChangesResponse(BaseModel):
    changes: List[StandardChange]

class ProcurementListResponse(BaseModel):
    sessions: List[ProcurementSessionResponse]

class ClarifyRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class ClarificationQuestion(BaseModel):
    parameter: str
    question: str
    options: List[str]
    required_for: Optional[str] = None

class ClarifyResponse(BaseModel):
    query: str
    is_ambiguous: bool
    detected_product: Optional[str] = None
    detected_division: Optional[str] = None
    clarifying_questions: List[ClarificationQuestion] = []
    candidate_standards_considered: List[str] = []
    message: str

