import type { BasketStandard, BasketRelationship, VerificationGap } from './basket.types';

export const mockBasketStandards: BasketStandard[] = [
  {
    id: 'IS 1234',
    year: '2025',
    title: 'Low Voltage Electrical Switchgear',
    type: 'PRIMARY STANDARD',
    status: 'CURRENT',
    verificationStatus: 'VERIFIED',
    evidenceCount: 3,
  },
  {
    id: 'IS 5678',
    year: '2023',
    title: 'Enclosures for Electrical Equipment',
    type: 'ENVIRONMENT',
    status: 'CURRENT',
    verificationStatus: 'NEEDS REVIEW',
    evidenceCount: 1,
  }
];

export const mockBasketRelationships: BasketRelationship[] = [
  { id: 'IS 9876 : 2024', type: 'TEST METHOD', description: 'Testing procedure for electrical assemblies' },
  { id: 'IS 4567 : 2020', type: 'SAFETY', description: 'Safety of machinery - Electrical equipment' },
  { id: 'IS 2222 : 2021', type: 'INSTALLATION', description: 'Code of practice for electrical wiring' },
];

export const mockVerificationGaps: VerificationGap[] = [
  { id: 'g1', standardId: 'IS 4567 : 2020', description: 'Certification requirement not independently confirmed.' },
  { id: 'g2', standardId: 'IS 8910 : 2024', description: 'Scope applicability requires review.' },
];
