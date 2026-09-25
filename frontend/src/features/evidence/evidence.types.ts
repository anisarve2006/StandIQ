export type EvidenceType = 'REQUIREMENT' | 'SCOPE' | 'TEST_METHOD' | 'SAFETY' | 'CERTIFICATION';
export type VerificationStatusType = 'VERIFIED' | 'REVIEW' | 'REJECTED';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EvidenceRecord {
  id: string;
  standardId: string;
  standardTitle: string;
  clause: string;
  page: number;
  source: string;
  excerpt: string;
  evidenceType: EvidenceType;
  verificationStatus: VerificationStatusType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  requirement: string;
  boundingBox: BoundingBox;
}
