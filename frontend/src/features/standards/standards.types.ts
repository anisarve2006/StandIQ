export interface StandardCandidate {
  id: string;
  year: string;
  title: string;
  description: string;
  status: string;
  type: string;
  relevance: { level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'; score: number };
  certification: string;
  reasons: string[];
  evidenceCount: number;
}

export interface StandardRelationship {
  id: string;
  type: string;
  targetId: string;
  description: string;
}

export interface ExcludedStandard {
  id: string;
  year: string;
  reasonTitle: string;
  description: string;
}
