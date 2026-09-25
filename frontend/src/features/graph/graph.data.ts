import type { GraphNode, GraphEdge } from './graph.types';

export const mockNodes: GraphNode[] = [
  { id: 'n1', type: 'PROCUREMENT', label: 'Electrical Distribution Panel', x: 400, y: 500, metadata: { status: 'ACTIVE' } },
  
  { id: 'n2', type: 'REQUIREMENT', label: 'Operating Voltage', metadata: { value: '415 V AC', coveredBy: 'IS 1234 : 2025' }, x: 200, y: 350 },
  { id: 'n3', type: 'REQUIREMENT', label: 'Protection Rating', metadata: { value: 'IP54', coveredBy: 'IS 5678 : 2023' }, x: 600, y: 350 },
  
  { id: 'n4', type: 'STANDARD', label: 'IS 1234 : 2025', status: 'CURRENT', metadata: { type: 'PRIMARY STANDARD' }, x: 400, y: 200 },
  
  { id: 'n5', type: 'TEST_METHOD', label: 'IS 9876 : 2024', status: 'CURRENT', metadata: { type: 'TEST METHOD' }, x: 150, y: 100 },
  { id: 'n6', type: 'SAFETY', label: 'IS 4567 : 2020', status: 'AMENDED', metadata: { type: 'SAFETY' }, x: 400, y: 50 },
  { id: 'n7', type: 'INSTALLATION', label: 'IS 2222 : 2021', status: 'CURRENT', metadata: { type: 'INSTALLATION' }, x: 650, y: 100 },
  
  { id: 'n8', type: 'CERTIFICATION', label: 'BIS Product Cert', status: 'MANDATORY', metadata: { type: 'CERTIFICATION' }, x: 800, y: 200 },
];

export const mockEdges: GraphEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', relationship: 'PRIMARY' },
  { id: 'e2', source: 'n1', target: 'n3', relationship: 'PRIMARY' },
  { id: 'e3', source: 'n2', target: 'n4', relationship: 'PRIMARY' },
  { id: 'e4', source: 'n3', target: 'n4', relationship: 'PRIMARY' },
  
  { id: 'e5', source: 'n4', target: 'n5', relationship: 'TEST_METHOD' },
  { id: 'e6', source: 'n4', target: 'n6', relationship: 'SAFETY' },
  { id: 'e7', source: 'n4', target: 'n7', relationship: 'INSTALLATION' },
  
  { id: 'e8', source: 'n4', target: 'n8', relationship: 'CERTIFICATION' },
];
