export interface TenderFinding {
  id: string;
  type: string;
  standardId: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';
  currentVersion?: string;
  issue?: string;
  evidence?: {
    id: string;
    year: string;
    clause: string;
    page: string;
  };
  recommendedAction?: string;
}

export interface RequirementCoverage {
  requirement: string;
  coverage: string;
  status: string;
}

export interface MissingRequirement {
  parameter: string;
  description: string;
  status: string;
}

export interface TenderConflict {
  id: string;
  description: string;
}
