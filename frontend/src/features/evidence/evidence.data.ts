import type { EvidenceRecord } from './evidence.types';

export const mockEvidence: EvidenceRecord[] = [
  {
    id: 'EV-001',
    standardId: 'IS 1234:2026',
    standardTitle: 'Electrical Distribution Equipment',
    clause: '5.2',
    page: 12,
    source: 'IS 1234:2026',
    excerpt: '[DEMO EVIDENCE] The electrical distribution equipment shall be enclosed in a protective cabinet adhering to IP54 standards.',
    evidenceType: 'REQUIREMENT',
    verificationStatus: 'VERIFIED',
    confidence: 'HIGH',
    requirement: 'Electrical panel enclosure',
    boundingBox: { x: 10, y: 30, width: 80, height: 15 }
  },
  {
    id: 'EV-002',
    standardId: 'IS 4567:2024',
    standardTitle: 'Testing of Electrical Equipment',
    clause: '8.1',
    page: 45,
    source: 'IS 4567:2024',
    excerpt: '[DEMO EVIDENCE] Dielectric testing must be conducted at 2000V for 1 minute without breakdown.',
    evidenceType: 'TEST_METHOD',
    verificationStatus: 'VERIFIED',
    confidence: 'HIGH',
    requirement: 'Dielectric test',
    boundingBox: { x: 15, y: 50, width: 70, height: 10 }
  },
  {
    id: 'EV-003',
    standardId: 'IS 8910:2023',
    standardTitle: 'Code of Practice for Installation',
    clause: '3.4',
    page: 8,
    source: 'IS 8910:2023',
    excerpt: '[DEMO EVIDENCE] Scope covers installation of low-voltage electrical distribution panels in commercial buildings.',
    evidenceType: 'SCOPE',
    verificationStatus: 'REVIEW',
    confidence: 'MEDIUM',
    requirement: 'Installation context',
    boundingBox: { x: 10, y: 20, width: 80, height: 12 }
  },
  {
    id: 'EV-004',
    standardId: 'IS 2468:2025',
    standardTitle: 'Safety of Machinery',
    clause: '12.2',
    page: 102,
    source: 'IS 2468:2025',
    excerpt: '[DEMO EVIDENCE] Emergency stop circuits shall be hardwired and functional under all operating conditions.',
    evidenceType: 'SAFETY',
    verificationStatus: 'REJECTED',
    confidence: 'LOW',
    requirement: 'Emergency stop circuit',
    boundingBox: { x: 20, y: 60, width: 60, height: 20 }
  },
  {
    id: 'EV-005',
    standardId: 'IS 1234:2026',
    standardTitle: 'Electrical Distribution Equipment',
    clause: '9.1',
    page: 24,
    source: 'IS 1234:2026',
    excerpt: '[DEMO EVIDENCE] The equipment requires mandatory BIS product certification before sale or distribution.',
    evidenceType: 'CERTIFICATION',
    verificationStatus: 'REVIEW',
    confidence: 'HIGH',
    requirement: 'BIS Certification',
    boundingBox: { x: 10, y: 75, width: 80, height: 10 }
  }
];
