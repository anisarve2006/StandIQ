import type { TenderFinding, RequirementCoverage, MissingRequirement, TenderConflict } from './tender-health.types';

export const mockFindings: TenderFinding[] = [
  {
    id: 'f1',
    type: 'STALE EDITION',
    standardId: 'IS 1234:2018',
    description: 'A newer edition exists.',
    priority: 'HIGH',
    currentVersion: 'IS 1234:2026',
    issue: 'The procurement references an older edition.',
    evidence: { id: 'IS 1234', year: '2018', clause: '4.2', page: '12' },
    recommendedAction: 'Review the referenced edition and update the procurement specification if applicable.'
  },
  {
    id: 'f2',
    type: 'CERTIFICATION GAP',
    standardId: 'Electrical Panel Procurement',
    description: 'Certification requirement not identified.',
    priority: 'HIGH'
  },
  {
    id: 'f3',
    type: 'SCOPE MISMATCH',
    standardId: 'IS 5678:2022',
    description: 'The referenced standard may not match the procurement application.',
    priority: 'MEDIUM'
  },
  {
    id: 'f4',
    type: 'NOT FOUND',
    standardId: 'IS 9999:2015',
    description: 'Referenced standard could not be matched to the available catalogue.',
    priority: 'MEDIUM'
  },
  {
    id: 'f5',
    type: 'AMENDMENT NOT REFERENCED',
    standardId: 'IS 4567:2024',
    description: 'The specification does not reference the identified amendment.',
    priority: 'INFORMATIONAL'
  }
];

export const mockCoverage: RequirementCoverage[] = [
  { requirement: 'Operating voltage', coverage: 'IS 1234', status: 'VERIFIED' },
  { requirement: 'Protection rating', coverage: 'IS 1234', status: 'VERIFIED' },
  { requirement: 'Rated current', coverage: '—', status: 'MISSING' },
  { requirement: 'Test method', coverage: 'IS 9876', status: 'COVERED' },
  { requirement: 'Certification', coverage: '—', status: 'GAP' },
  { requirement: 'Operating temperature', coverage: '—', status: 'UNKNOWN' }
];

export const mockMissing: MissingRequirement[] = [
  { parameter: 'RATED CURRENT', description: 'Required for applicability assessment.', status: 'MISSING' },
  { parameter: 'OPERATING TEMPERATURE', description: 'Not specified.', status: 'UNKNOWN' },
  { parameter: 'TEST METHOD', description: 'No method referenced.', status: 'MISSING' }
];

export const mockConflicts: TenderConflict[] = [
  { id: 'c1', description: 'Item 03 specifies IP54.\nItem 07 specifies IP65.\n\nReview whether the environmental requirement is consistent across items.' }
];
