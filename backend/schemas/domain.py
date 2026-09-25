from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel
from enum import Enum

class RequirementCategory(str, Enum):
    PRODUCT = "PRODUCT"
    APPLICATION = "APPLICATION"
    MATERIAL = "MATERIAL"
    DIMENSION = "DIMENSION"
    CAPACITY = "CAPACITY"
    ELECTRICAL = "ELECTRICAL"
    ENVIRONMENT = "ENVIRONMENT"
    PERFORMANCE = "PERFORMANCE"
    SAFETY = "SAFETY"
    TESTING = "TESTING"
    INSTALLATION = "INSTALLATION"
    CERTIFICATION = "CERTIFICATION"
    REGULATORY = "REGULATORY"
    STANDARD_REFERENCE = "STANDARD_REFERENCE"

class Requirement(BaseModel):
    id: Optional[str] = None
    category: RequirementCategory
    name: str
    source_text: str
    normalized_value: Optional[float] = None
    unit: Optional[str] = None
    operator: Optional[str] = None
    expected_value: Optional[Any] = None
    confidence: Optional[float] = None
    source_clause: Optional[str] = None
    required: bool = True
    extraction_method: Optional[str] = None

class ApplicabilityStatus(str, Enum):
    SATISFIES = "SATISFIES"
    VIOLATES = "VIOLATES"
    UNKNOWN = "UNKNOWN"

class ApplicabilityResult(BaseModel):
    requirement: Requirement
    standard: Dict[str, Any]
    status: ApplicabilityStatus
    reason: str
    evidence: Optional[Dict[str, Any]] = None
    evaluated_value: Optional[Any] = None
    expected_value: Optional[Any] = None

class Evidence(BaseModel):
    standard_id: Optional[str] = None
    title: Optional[str] = None
    source: Optional[str] = None
    page: Optional[int] = None
    clause: Optional[str] = None
    section: Optional[str] = None
    text: Optional[str] = None
    evidence_type: Optional[str] = None
    relevance: Optional[float] = None
    provenance: Optional[str] = None

class VersionStatus(str, Enum):
    CURRENT = "CURRENT"
    SUPERSEDED = "SUPERSEDED"
    WITHDRAWN = "WITHDRAWN"
    UNKNOWN = "UNKNOWN"

class VersionInfo(BaseModel):
    family_id: str
    version: Optional[str] = None
    publication_date: Optional[str] = None
    effective_date: Optional[str] = None
    status: VersionStatus = VersionStatus.UNKNOWN
    amendment: Optional[str] = None
    supersedes: Optional[List[str]] = None
    superseded_by: Optional[List[str]] = None

class CertificationType(str, Enum):
    BIS_PRODUCT_CERTIFICATION = "BIS_PRODUCT_CERTIFICATION"
    CRS = "CRS"
    HALLMARKING = "HALLMARKING"
    QCO = "QCO"

class CertificationStatus(str, Enum):
    REQUIRED = "REQUIRED"
    OPTIONAL = "OPTIONAL"
    UNKNOWN = "UNKNOWN"

class CertificationInfo(BaseModel):
    standard: str
    certification_type: CertificationType
    status: CertificationStatus
    mandatory: bool
    applicability: Optional[str] = None
    effective_date: Optional[str] = None
    source: Optional[str] = None
    evidence: Optional[str] = None
