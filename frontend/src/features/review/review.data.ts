import type { ReviewItem, ChecklistItem } from './review.types';

export const mockReviewQueue: ReviewItem[] = [
  {
    id: 'IS 1234',
    year: '2025',
    title: 'Low Voltage Electrical Switchgear',
    type: 'PRIMARY STANDARD',
    confidence: { level: 'HIGH', score: 0.94 },
    applicability: ['Product category', 'Operating environment', 'Technical specification'],
    certification: 'BIS PRODUCT CERTIFICATION',
    evidence: [
      { id: 'e1', standardId: 'IS 1234', year: '2025', clause: '5.2', page: '18', text: 'Demo evidence text demonstrating voltage rating requirements.', verification: 'SUPPORTED' },
      { id: 'e2', standardId: 'IS 1234', year: '2025', clause: '7.1', page: '22', text: 'Environmental operating conditions match indoor commercial specifications.', verification: 'UNKNOWN' }
    ],
    status: 'NEEDS REVIEW'
  },
  {
    id: 'IS 5678',
    year: '2023',
    title: 'Enclosures for Electrical Equipment',
    type: 'ENVIRONMENT',
    confidence: { level: 'HIGH', score: 0.88 },
    applicability: ['Protection rating requirement', 'Installation environment'],
    certification: 'NOT IDENTIFIED',
    evidence: [
      { id: 'e3', standardId: 'IS 5678', year: '2023', clause: '4.1', page: '10', text: 'IP54 testing parameters align with required procurement specs.', verification: 'SUPPORTED' }
    ],
    status: 'VERIFIED'
  },
  {
    id: 'IS 2468',
    year: '2020',
    title: 'Safety of Machinery - Electrical Equipment',
    type: 'SAFETY',
    confidence: { level: 'MEDIUM', score: 0.72 },
    applicability: ['Safety context', 'General electrical application'],
    certification: 'UNKNOWN',
    evidence: [
      { id: 'e4', standardId: 'IS 2468', year: '2020', clause: '1.2', page: '5', text: 'General safety applicability.', verification: 'UNKNOWN' }
    ],
    status: 'UNVERIFIED'
  }
];

export const mockChecklist: ChecklistItem[] = [
  { id: 'c1', label: 'Standard exists' },
  { id: 'c2', label: 'Current edition checked' },
  { id: 'c3', label: 'Scope reviewed' },
  { id: 'c4', label: 'Evidence reviewed' },
  { id: 'c5', label: 'Certification requirement confirmed' },
  { id: 'c6', label: 'Conflicting standards reviewed' }
];
