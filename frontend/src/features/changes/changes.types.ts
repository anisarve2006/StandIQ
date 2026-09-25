export type ChangeType = 'NEW_EDITION' | 'AMENDMENT' | 'REAFFIRMED' | 'SUPERSEDED' | 'WITHDRAWN' | 'UNDER_REVISION';
export type ChangeImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AffectedProcurement {
  id: string;
  name: string;
  status: string;
}

export interface StandardChange {
  id: string;
  standardId: string;
  title: string;
  changeType: ChangeType;
  previousVersion: string;
  currentVersion: string;
  date: string;
  impact: ChangeImpact;
  affectedProcurements: AffectedProcurement[];
}
