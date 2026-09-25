import type { ApprovalCheck, ApprovalIssue } from './approval.types';

export const mockApprovalChecks: ApprovalCheck[] = [
  { id: 'ac1', label: 'All selected standards reviewed' },
  { id: 'ac2', label: 'Current editions checked' },
  { id: 'ac3', label: 'Evidence reviewed' },
  { id: 'ac4', label: 'Requirement coverage reviewed' },
  { id: 'ac5', label: 'Certification requirements confirmed' },
  { id: 'ac6', label: 'Unresolved findings reviewed' },
  { id: 'ac7', label: 'Specification completeness confirmed' },
];

export const mockApprovalIssues: ApprovalIssue[] = [
  { id: 'ai1', type: 'CERTIFICATION', description: 'Applicability not independently confirmed.' },
  { id: 'ai2', type: 'MISSING REQUIREMENT', description: 'Rated current is not specified.' },
];
