export type VerificationState = 'UNVERIFIED' | 'NEEDS REVIEW' | 'PARTIALLY VERIFIED' | 'VERIFIED' | 'REJECTED';

export interface ReviewEvidence {
  id: string;
  standardId: string;
  year: string;
  clause: string;
  page: string;
  text: string;
  verification: 'SUPPORTED' | 'UNSUPPORTED' | 'UNKNOWN';
}

export interface ReviewItem {
  id: string;
  year: string;
  title: string;
  type: string;
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; score: number };
  applicability: string[];
  certification: string;
  evidence: ReviewEvidence[];
  status: VerificationState;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
}
