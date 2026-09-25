export type NodeType = 'PROCUREMENT' | 'REQUIREMENT' | 'STANDARD' | 'CLAUSE' | 'TEST_METHOD' | 'SAFETY' | 'INSTALLATION' | 'MATERIAL' | 'CERTIFICATION';
export type EdgeType = 'PRIMARY' | 'TEST_METHOD' | 'TERMINOLOGY' | 'SAFETY' | 'INSTALLATION' | 'MATERIAL' | 'INTL_EQUIVALENT' | 'CERTIFICATION';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  status?: string;
  metadata?: Record<string, string>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: EdgeType;
}
