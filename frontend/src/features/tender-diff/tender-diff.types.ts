export type IssueType = 'MISSING_STANDARD' | 'STALE_EDITION' | 'SUPERSEDED' | 'WRONG_PART' | 'SCOPE_MISMATCH' | 'AMENDMENT_NOT_REFERENCED' | 'CERT_REQUIREMENT_MISSING' | 'CONFLICT';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type DiffStatus = 'OPEN' | 'ACCEPTED' | 'REJECTED';

export interface DiffFinding {
  id: string;
  requirement: string;
  currentText: string;
  issueType: IssueType;
  issueDescription: string;
  currentReference: string;
  recommendedReference: string;
  recommendedText: string;
  status: DiffStatus;
  severity: IssueSeverity;
  rejectionReason?: string;
}
