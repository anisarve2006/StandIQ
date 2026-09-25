import type { StandardCandidate, StandardRelationship, ExcludedStandard } from './standards.types';

export const mockCandidates: StandardCandidate[] = [
  {
    id: 'IS 1234',
    year: '2025',
    title: 'Low Voltage Electrical Switchgear',
    description: 'Applies to low-voltage switchgear assemblies for use in power distribution.',
    status: 'CURRENT',
    type: 'PRIMARY STANDARD',
    relevance: { level: 'HIGH', score: 0.94 },
    certification: 'BIS PRODUCT CERTIFICATION',
    reasons: ['Product category', 'Operating environment', 'Technical specification'],
    evidenceCount: 3,
  },
  {
    id: 'IS 5678',
    year: '2023',
    title: 'Enclosures for Electrical Equipment',
    description: 'Specifies degrees of protection provided by enclosures (IP Code).',
    status: 'CURRENT',
    type: 'ENVIRONMENT',
    relevance: { level: 'HIGH', score: 0.88 },
    certification: 'NOT IDENTIFIED',
    reasons: ['Protection rating requirement', 'Installation environment'],
    evidenceCount: 2,
  },
  {
    id: 'IS 2468',
    year: '2020',
    title: 'Safety of Machinery - Electrical Equipment',
    description: 'General requirements for electrical equipment of machines.',
    status: 'AMENDED',
    type: 'SAFETY',
    relevance: { level: 'MEDIUM', score: 0.72 },
    certification: 'UNKNOWN',
    reasons: ['Safety context', 'General electrical application'],
    evidenceCount: 1,
  }
];

export const mockRelationships: StandardRelationship[] = [
  { id: 'rel1', type: 'TEST METHOD', targetId: 'IS 9876 : 2024', description: 'Testing procedure for electrical assemblies' },
  { id: 'rel2', type: 'MATERIAL', targetId: 'IS 1111 : 2019', description: 'Copper conductors for electrical distribution' },
  { id: 'rel3', type: 'INSTALLATION', targetId: 'IS 2222 : 2021', description: 'Code of practice for electrical wiring installations' },
  { id: 'rel4', type: 'INTL_EQUIVALENT', targetId: 'IEC 61439-1', description: 'Low-voltage switchgear and controlgear assemblies' },
];

export const mockExcluded: ExcludedStandard[] = [
  {
    id: 'IS 5678',
    year: '2023',
    reasonTitle: 'SCOPE MISMATCH',
    description: 'The scope does not match the specified procurement application.'
  },
  {
    id: 'IS 8910',
    year: '2022',
    reasonTitle: 'WRONG PART',
    description: 'The referenced part does not correspond to the identified product category.'
  },
  {
    id: 'IS 2468',
    year: '2018',
    reasonTitle: 'SUPERSEDED',
    description: 'A newer edition is available.'
  }
];
