import type { Requirement, InformationGap, ClarificationQuestion } from './requirements.types';

export const mockRequirements: Requirement[] = [
  { id: 'r1', category: 'PERFORMANCE', parameter: 'Operating voltage', value: '415 V AC', status: 'SPECIFIED', confidence: 'HIGH', source: 'Tender specification · p.4' },
  { id: 'r2', category: 'PRODUCT', parameter: 'Protection rating', value: 'IP54', status: 'SPECIFIED', confidence: 'HIGH', source: 'Tender specification · p.5' },
  { id: 'r3', category: 'ENVIRONMENT', parameter: 'Installation environment', value: 'Indoor', status: 'SPECIFIED', confidence: 'HIGH', source: 'Tender specification · p.2' },
  { id: 'r4', category: 'PERFORMANCE', parameter: 'Rated current', value: '—', status: 'MISSING', confidence: 'UNKNOWN' },
  { id: 'r5', category: 'TESTING', parameter: 'Test method', value: '—', status: 'UNKNOWN', confidence: 'UNKNOWN' },
  { id: 'r6', category: 'CERTIFICATION', parameter: 'Certification', value: '—', status: 'UNKNOWN', confidence: 'UNKNOWN' },
];

export const mockGaps: InformationGap[] = [
  { id: 'g1', parameter: 'RATED CURRENT', description: 'Required to determine applicable standards.' },
  { id: 'g2', parameter: 'OPERATING TEMPERATURE', description: 'Not specified.' },
];

export const mockQuestions: ClarificationQuestion[] = [
  { id: 'q1', question: 'What is the rated current of the panel?' },
  { id: 'q2', question: 'What is the maximum operating temperature?' },
];
