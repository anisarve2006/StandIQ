import type { DiffFinding } from './tender-diff.types';

export const mockDiffFindings: DiffFinding[] = [
  {
    id: 'td1',
    requirement: 'Electrical panel enclosure',
    currentText: 'Enclosures shall adhere to IS 1234:2022 standards.',
    issueType: 'STALE_EDITION',
    issueDescription: 'Current reference is marked as outdated in this demo fixture.',
    currentReference: 'IS 1234:2022',
    recommendedReference: 'IS 1234:2026',
    recommendedText: 'Update the referenced edition and associated requirements where applicable.',
    status: 'OPEN',
    severity: 'HIGH'
  },
  {
    id: 'td2',
    requirement: 'Testing specification',
    currentText: 'Testing to be done as per manufacturer guidelines.',
    issueType: 'MISSING_STANDARD',
    issueDescription: 'Testing specification lacks standardized reference.',
    currentReference: 'None',
    recommendedReference: 'IS 4567:2024',
    recommendedText: 'Include standard testing procedure references for regulatory compliance.',
    status: 'OPEN',
    severity: 'MEDIUM'
  },
  {
    id: 'td3',
    requirement: 'Installation requirement',
    currentText: 'Installation for outdoor environments.',
    issueType: 'SCOPE_MISMATCH',
    issueDescription: 'Referenced standard primarily covers indoor environments.',
    currentReference: 'IS 8910:2023',
    recommendedReference: 'IS 9999:2025',
    recommendedText: 'Reference outdoor-specific installation standard.',
    status: 'OPEN',
    severity: 'HIGH'
  },
  {
    id: 'td4',
    requirement: 'Emergency stop safety',
    currentText: 'Use emergency stops on machinery.',
    issueType: 'SUPERSEDED',
    issueDescription: 'Safety standard has been superseded by a newer comprehensive standard.',
    currentReference: 'IS 2468:2018',
    recommendedReference: 'IS 2468:2025',
    recommendedText: 'Adopt latest safety requirements for emergency stops.',
    status: 'ACCEPTED',
    severity: 'HIGH'
  },
  {
    id: 'td5',
    requirement: 'BIS Certification',
    currentText: 'Supplier must provide quality certificates.',
    issueType: 'CERT_REQUIREMENT_MISSING',
    issueDescription: 'Mandatory BIS product certification clause is missing.',
    currentReference: 'None',
    recommendedReference: 'IS 1234:2026',
    recommendedText: 'Explicitly mandate BIS certification as per IS 1234.',
    status: 'OPEN',
    severity: 'HIGH'
  }
];
