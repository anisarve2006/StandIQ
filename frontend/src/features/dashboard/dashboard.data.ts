import type { DashboardData } from './dashboard.types';

export const mockDashboardData: DashboardData = {
  metrics: {
    standardsRequiringReview: 12,
    tenderFindings: 7,
    certificationGaps: 3,
    recentChanges: 5,
  },
  activeProcurements: [
    {
      id: 'p-001',
      name: 'Electrical Panel Procurement',
      category: 'Electrical',
      standardsCount: 12,
      findingsCount: 4,
      health: 'REVIEW',
      updatedAt: '2H AGO',
    },
    {
      id: 'p-002',
      name: 'Cement Supply',
      category: 'Construction',
      standardsCount: 8,
      findingsCount: 0,
      health: 'READY',
      updatedAt: '1D AGO',
    },
    {
      id: 'p-003',
      name: 'Structural Steel',
      category: 'Infrastructure',
      standardsCount: 16,
      findingsCount: 7,
      health: 'ATTENTION',
      updatedAt: '2D AGO',
    },
  ],
  reviewQueue: [
    {
      id: 'r-001',
      type: 'STALE_EDITION',
      title: 'IS 1234:2018',
      description: 'New edition detected',
      actionLabel: 'REVIEW',
    },
    {
      id: 'r-002',
      type: 'CERTIFICATION_GAP',
      title: 'Electrical Panel Procurement',
      description: 'Certification requirement not identified',
      actionLabel: 'REVIEW',
    },
    {
      id: 'r-003',
      type: 'SCOPE_MISMATCH',
      title: 'IS 5678:2022',
      description: 'Recommended standard may not match application',
      actionLabel: 'REVIEW',
    },
  ],
  recentChanges: [
    {
      id: 'c-001',
      standardId: 'IS 1234 : 2026',
      type: 'NEW EDITION',
      date: '12 SEP 2026',
    },
    {
      id: 'c-002',
      standardId: 'IS 4567 : 2025',
      type: 'AMENDMENT',
      date: '08 SEP 2026',
    },
    {
      id: 'c-003',
      standardId: 'IS 8910 : 2026',
      type: 'REAFFIRMED',
      date: '02 SEP 2026',
    },
  ]
};
