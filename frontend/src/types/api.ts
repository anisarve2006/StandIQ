export type RequirementCategory = 
  | "PRODUCT" | "APPLICATION" | "MATERIAL" | "DIMENSION"
  | "CAPACITY" | "ELECTRICAL" | "ENVIRONMENT" | "PERFORMANCE"
  | "SAFETY" | "TESTING" | "INSTALLATION" | "CERTIFICATION"
  | "REGULATORY" | "STANDARD_REFERENCE";

export interface Requirement {
  id?: string;
  category: RequirementCategory;
  name: string;
  source_text: string;
  normalized_value?: number;
  unit?: string;
  operator?: string;
  expected_value?: any;
  confidence?: number;
  source_clause?: string;
  required: boolean;
  extraction_method?: string;
}

export interface AlliedStandardResponse {
  source_standard: string;
  relationship: string;
  target_standard: string;
  reason?: string;
  evidence?: string;
}

export interface AlliedStandardsResponse {
  family_id: string;
  allied_standards: AlliedStandardResponse[];
}

export type VersionStatus = "CURRENT" | "SUPERSEDED" | "WITHDRAWN" | "UNKNOWN";

export interface VersionInfo {
  family_id: string;
  version?: string;
  publication_date?: string;
  effective_date?: string;
  status: VersionStatus;
  amendment?: string;
  supersedes?: string[];
  superseded_by?: string[];
}

export interface VersionResponse {
  family_id: string;
  version_info: VersionInfo;
}

export type CertificationType = "BIS_PRODUCT_CERTIFICATION" | "CRS" | "HALLMARKING" | "QCO";
export type CertificationStatus = "REQUIRED" | "OPTIONAL" | "UNKNOWN";

export interface CertificationInfo {
  standard: string;
  certification_type: CertificationType;
  status: CertificationStatus;
  mandatory: boolean;
  applicability?: string;
  effective_date?: string;
  source?: string;
  evidence?: string;
}

export interface CertificationResponse {
  family_id: string;
  certifications: CertificationInfo[];
}

export interface TenderClauseDetail {
  clause_id?: string;
  text: string;
  product?: string;
  requirement?: string;
  value?: string;
  unit?: string;
  category?: string;
  mandatory: boolean;
  referenced_standard?: string;
  source_location?: string;
}

export interface TenderAnalyzeRequest {
  tender_text: string;
}

export interface TenderAnalyzeResponse {
  clauses: TenderClauseDetail[];
  recommendations: Record<string, any>;
}

export interface TenderHealthFinding {
  severity: string;
  category: string;
  clause: string;
  message: string;
  suggested_action: string;
}

export interface TenderHealthRequest {
  session_id: string;
}

export interface TenderHealthResponse {
  findings: TenderHealthFinding[];
}

export interface TenderDiffRequest {
  version_a_text: string;
  version_b_text: string;
}

export interface TenderDiffResponse {
  added_clauses: string[];
  removed_clauses: string[];
  modified_clauses: Record<string, string>[];
  changed_technical_values: Record<string, any>[];
  changed_standards: Record<string, string>[];
}

export interface CompletenessResponse {
  covered: string[];
  partial: string[];
  missing: string[];
  clarifying_questions: string[];
}

export interface SpecificationGenerateRequest {
  requirements: Requirement[];
  standards: Record<string, any>[];
  evidence: Record<string, any>[];
}

export interface SpecificationGenerateResponse {
  specification_clause: string;
}

export interface ProcurementSessionCreateRequest {
  title: string;
}

export interface ProcurementSessionResponse {
  session_id: string;
  title: string;
  requirements: Requirement[];
  selected_standards: Record<string, any>[];
  evidence: Record<string, any>[];
  verification_state: string;
  generated_specification?: string;
  tender_findings: TenderHealthFinding[];
}

export interface ExportRequest {
  session_id: string;
  format: string;
}

export interface ExportResponse {
  content: string;
  content_type: string;
}

export interface DashboardSummary {
  active_procurements: number;
  standards_requiring_review: number;
  tender_findings: number;
  certification_gaps: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface StandardChange {
  id: string;
  standard_id: string;
  change_type: string;
  previous_version: string;
  current_version: string;
  date: string;
  impact: string;
  affected_procurements: Record<string, string>[];
}

export interface ChangesResponse {
  changes: StandardChange[];
}

export interface StandardRecommendationRequest {
  query: string;
  context?: Record<string, any>;
  limit?: number;
  filters?: Record<string, any>;
}

export interface ConfidenceScore {
  confidence_level: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  reasons: string[];
}

export interface StandardRecommendation {
  standard_id: string;
  title: string;
  confidence: ConfidenceScore;
  verification_status: string;
  evidence: Record<string, any>[];
}

export interface RecommendationResponse {
  query: string;
  recommended_standards: StandardRecommendation[];
  alternative_candidates: Record<string, any>[];
  latency_breakdown_ms: Record<string, number>;
}
