export type RequirementStatus = 'SPECIFIED' | 'MISSING' | 'CONFLICT' | 'UNKNOWN' | 'VERIFIED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface Requirement {
  id: string;
  category: string;
  parameter: string;
  value: string;
  status: RequirementStatus;
  confidence: ConfidenceLevel;
  source?: string;
}

export interface InformationGap {
  id: string;
  parameter: string;
  description: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
}
