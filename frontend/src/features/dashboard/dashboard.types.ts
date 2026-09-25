export type ProcurementHealth = 'READY' | 'REVIEW' | 'ATTENTION';

export interface ProcurementSummary {
  id: string;
  name: string;
  category: string;
  standardsCount: number;
  findingsCount: number;
  health: ProcurementHealth;
  updatedAt: string;
}

export interface ReviewTask {
  id: string;
  type: string;
  title: string;
  description: string;
  actionLabel: string;
}

export interface StandardChange {
  id: string;
  standardId: string;
  type: string;
  date: string;
}

export interface DashboardData {
  metrics: {
    standardsRequiringReview: number;
    tenderFindings: number;
    certificationGaps: number;
    recentChanges: number;
  };
  activeProcurements: ProcurementSummary[];
  reviewQueue: ReviewTask[];
  recentChanges: StandardChange[];
}
