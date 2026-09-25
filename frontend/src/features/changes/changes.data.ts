import type { StandardChange } from './changes.types';

export const mockChanges: StandardChange[] = [
  {
    id: 'c1',
    standardId: 'IS 1234',
    title: 'Low Voltage Electrical Switchgear',
    changeType: 'NEW_EDITION',
    previousVersion: 'IS 1234:2022',
    currentVersion: 'IS 1234:2026',
    date: '12 SEP 2026',
    impact: 'HIGH',
    affectedProcurements: [
      { id: 'p1', name: 'Electrical Distribution Panel', status: 'IN REVIEW' },
      { id: 'p2', name: 'Commercial Switchgear', status: 'DRAFT' }
    ]
  },
  {
    id: 'c2',
    standardId: 'IS 4567',
    title: 'Testing of Electrical Equipment',
    changeType: 'AMENDMENT',
    previousVersion: 'IS 4567:2024',
    currentVersion: 'Amendment 2',
    date: '08 SEP 2026',
    impact: 'MEDIUM',
    affectedProcurements: []
  },
  {
    id: 'c3',
    standardId: 'IS 8910',
    title: 'Code of Practice for Installation',
    changeType: 'REAFFIRMED',
    previousVersion: 'IS 8910:2023',
    currentVersion: 'IS 8910:2023',
    date: '02 SEP 2026',
    impact: 'LOW',
    affectedProcurements: []
  },
  {
    id: 'c4',
    standardId: 'IS 2468',
    title: 'Safety of Machinery',
    changeType: 'SUPERSEDED',
    previousVersion: 'IS 2468:2018',
    currentVersion: 'IS 2468:2025',
    date: '29 AUG 2026',
    impact: 'HIGH',
    affectedProcurements: [
      { id: 'p3', name: 'Structural Steel', status: 'ATTENTION' }
    ]
  },
  {
    id: 'c5',
    standardId: 'IS 3579',
    title: 'Obsolete Wiring Standard',
    changeType: 'WITHDRAWN',
    previousVersion: 'IS 3579:2019',
    currentVersion: '—',
    date: '20 AUG 2026',
    impact: 'HIGH',
    affectedProcurements: [
      { id: 'p4', name: 'Legacy Facilities', status: 'COMPLETED' }
    ]
  }
];
