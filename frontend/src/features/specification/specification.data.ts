import type { SpecificationSection } from './specification.types';

export const mockSections: SpecificationSection[] = [
  {
    id: 's1',
    title: '01 — GENERAL REQUIREMENTS',
    requirements: []
  },
  {
    id: 's2',
    title: '02 — PRODUCT REQUIREMENTS',
    requirements: [
      { id: 'r1', sectionId: 's2', parameter: 'Operating Voltage', value: '415 V AC', sourceLabel: 'IS 1234 : 2025 · §5.2 · p.18', sourceStatus: 'VERIFIED' },
      { id: 'r2', sectionId: 's2', parameter: 'Rated Current', value: 'Not specified', sourceLabel: 'Missing', sourceStatus: 'MISSING' }
    ]
  },
  {
    id: 's3',
    title: '03 — PERFORMANCE',
    requirements: [
      { id: 'r3', sectionId: 's3', parameter: 'Protection Rating', value: 'IP54', sourceLabel: 'IS 5678 : 2023', sourceStatus: 'VERIFIED' }
    ]
  },
  {
    id: 's4',
    title: '04 — MATERIALS',
    requirements: []
  },
  {
    id: 's5',
    title: '05 — TESTING',
    requirements: []
  },
  {
    id: 's6',
    title: '06 — SAFETY',
    requirements: []
  },
  {
    id: 's7',
    title: '07 — INSTALLATION',
    requirements: []
  },
];
