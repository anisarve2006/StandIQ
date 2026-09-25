from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from schemas.domain import VersionInfo, CertificationInfo, Requirement, ApplicabilityResult

class AlliedStandardResponse(BaseModel):
    source_standard: str
    relationship: str
    target_standard: str
    reason: Optional[str] = None
    evidence: Optional[str] = None

class AlliedStandardsResponse(BaseModel):
    family_id: str
    allied_standards: List[AlliedStandardResponse]

class VersionResponse(BaseModel):
    family_id: str
    version_info: VersionInfo

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
