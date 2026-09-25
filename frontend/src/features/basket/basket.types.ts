export interface BasketStandard {
  id: string;
  year: string;
  title: string;
  type: string;
  status: string;
  verificationStatus: string;
  evidenceCount: number;
}

export interface BasketRelationship {
  id: string;
  type: string;
  description: string;
}

export interface VerificationGap {
  id: string;
  standardId: string;
  description: string;
}
