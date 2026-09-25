import type { ProcurementRecord } from './procurements.types';

export const mockProcurements: ProcurementRecord[] = [
  { id: 'p1', name: 'Electrical Distribution Panel', category: 'Electrical Equipment', status: 'IN_REVIEW', findingCount: 4, standardCount: 7, updatedAt: '24 SEP 2026' },
  { id: 'p2', name: 'Cement Supply', category: 'Construction Materials', status: 'READY', findingCount: 0, standardCount: 8, updatedAt: '22 SEP 2026' },
  { id: 'p3', name: 'Structural Steel', category: 'Infrastructure', status: 'ATTENTION', findingCount: 7, standardCount: 16, updatedAt: '20 SEP 2026' },
  { id: 'p4', name: 'HVAC Equipment', category: 'Mechanical', status: 'DRAFT', findingCount: 0, standardCount: 0, updatedAt: '18 SEP 2026' },
  { id: 'p5', name: 'Fire Safety System', category: 'Safety Equipment', status: 'ACTIVE' as any, findingCount: 2, standardCount: 5, updatedAt: '15 SEP 2026' },
  { id: 'p6', name: 'Office Furniture', category: 'Facilities', status: 'COMPLETED', findingCount: 0, standardCount: 3, updatedAt: '10 SEP 2026' }
];
