import { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { mockNodes, mockEdges } from './graph.data';


export default function KnowledgeGraphPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return mockNodes;
    if (filterType === 'STANDARDS') return mockNodes.filter(n => n.type === 'STANDARD');
    if (filterType === 'REQUIREMENTS') return mockNodes.filter(n => n.type === 'REQUIREMENT');
    return mockNodes.filter(n => n.type === filterType);
  }, [filterType]);

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  const visibleEdges = mockEdges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  const selectedNode = mockNodes.find(n => n.id === selectedNodeId);

  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    connected.add(selectedNodeId);
    mockEdges.forEach(e => {
      if (e.source === selectedNodeId) connected.add(e.target);
      if (e.target === selectedNodeId) connected.add(e.source);
    });
    return connected;
  }, [selectedNodeId]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="KNOWLEDGE GRAPH"
        title="STANDARD RELATIONSHIP MAP"
        description="Explore relationships between procurement requirements, Indian Standards, clauses and allied standards."
      />

      <SplitPane
        primary={
          <div className="flex flex-col gap-6 w-full h-[600px] border border-border bg-surface relative overflow-hidden rounded-sm">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border" />
                </marker>
              </defs>
              {visibleEdges.map(edge => {
                const sourceNode = mockNodes.find(n => n.id === edge.source);
                const targetNode = mockNodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) return null;
                
                const isHighlighted = selectedNodeId ? (edge.source === selectedNodeId || edge.target === selectedNodeId) : true;
                const isDimmed = selectedNodeId && !isHighlighted;
                
                return (
                  <g key={edge.id} className={`transition-opacity duration-300 ${isDimmed ? 'opacity-10' : 'opacity-100'}`}>
                    <line 
                      x1={sourceNode.x} 
                      y1={sourceNode.y} 
                      x2={targetNode.x} 
                      y2={targetNode.y} 
                      stroke="currentColor" 
                      strokeWidth="1"
                      className={`${isHighlighted && selectedNodeId ? 'text-accent' : 'text-border'}`}
                      markerEnd="url(#arrowhead)"
                    />
                    <text 
                      x={(sourceNode.x + targetNode.x) / 2} 
                      y={(sourceNode.y + targetNode.y) / 2} 
                      dy="-5"
                      textAnchor="middle" 
                      className={`text-[10px] font-mono fill-current ${isHighlighted && selectedNodeId ? 'text-accent' : 'text-text-muted'}`}
                    >
                      {edge.relationship.replace('_', ' ')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {filteredNodes.map(node => {
              if (node.x === undefined || node.y === undefined) return null;
              
              const isSelected = selectedNodeId === node.id;
              const isConnected = connectedNodes.has(node.id);
              const isDimmed = selectedNodeId && !isConnected;
              
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-3 border rounded-sm transition-all duration-300 cursor-pointer
                    ${isSelected ? 'border-accent bg-accent/10 z-20' : 'border-border bg-surface hover:border-text-primary hover:bg-surface-elevated z-10'}
                    ${isDimmed ? 'opacity-20' : 'opacity-100'}
                  `}
                  style={{ left: node.x, top: node.y, minWidth: '140px' }}
                >
                  <Meta className={`mb-1 ${isSelected ? 'text-accent' : 'text-text-muted'}`}>{node.type}</Meta>
                  <Mono className="text-sm font-bold text-text-primary text-center leading-tight">{node.label}</Mono>
                  {node.status && (
                    <Badge variant={node.status === 'CURRENT' ? 'success' : 'neutral'} className="mt-2 text-[10px] py-0 px-1">
                      {node.status}
                    </Badge>
                  )}
                </button>
              );
            })}

            <div className="absolute top-4 left-4 z-30 w-64 bg-surface/90 backdrop-blur border border-border p-4 rounded-sm flex flex-col gap-4">
              <Select 
                label="SHOW" 
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setSelectedNodeId(null);
                }}
                options={[
                  { value: 'ALL', label: 'ALL' },
                  { value: 'STANDARDS', label: 'STANDARDS' },
                  { value: 'REQUIREMENTS', label: 'REQUIREMENTS' },
                  { value: 'TEST_METHOD', label: 'TEST METHODS' },
                  { value: 'SAFETY', label: 'SAFETY' },
                  { value: 'INSTALLATION', label: 'INSTALLATION' },
                  { value: 'MATERIAL', label: 'MATERIAL' },
                  { value: 'CERTIFICATION', label: 'CERTIFICATION' }
                ]} 
              />
            </div>
            
            <div className="absolute bottom-4 left-4 z-30 bg-surface/90 backdrop-blur border border-border p-4 rounded-sm flex flex-col gap-2 pointer-events-none">
              <Meta>RELATIONSHIPS</Meta>
              <div className="flex flex-col gap-1">
                <Mono className="text-[10px] text-text-secondary">PRIMARY</Mono>
                <Mono className="text-[10px] text-text-secondary">TEST METHOD</Mono>
                <Mono className="text-[10px] text-text-secondary">SAFETY</Mono>
                <Mono className="text-[10px] text-text-secondary">INSTALLATION</Mono>
                <Mono className="text-[10px] text-text-secondary">MATERIAL</Mono>
                <Mono className="text-[10px] text-text-secondary">CERTIFICATION</Mono>
              </div>
            </div>

          </div>
        }
        secondary={
          <div className="flex flex-col gap-6 sticky top-8">
            <SectionHeader number="" title="SELECTED NODE" />
            <div className="p-6 border border-border bg-surface flex flex-col gap-6 rounded-sm min-h-[300px]">
              {selectedNode ? (
                <>
                  <div className="flex flex-col gap-1">
                    <Mono className="text-lg font-bold text-text-primary">{selectedNode.label}</Mono>
                  </div>
                  
                  <div className="flex flex-col gap-1 pt-4 border-t border-border">
                    <Meta>TYPE</Meta>
                    <Mono className="text-sm">{selectedNode.type.replace('_', ' ')}</Mono>
                  </div>

                  {selectedNode.status && (
                    <div className="flex flex-col gap-1">
                      <Meta>STATUS</Meta>
                      <Mono className="text-sm text-text-primary">{selectedNode.status}</Mono>
                    </div>
                  )}

                  {selectedNode.metadata && Object.entries(selectedNode.metadata).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <Meta>{key.toUpperCase()}</Meta>
                      <Mono className="text-sm">{val}</Mono>
                    </div>
                  ))}

                  <div className="flex flex-col gap-1">
                    <Meta>RELATIONSHIPS</Meta>
                    <Mono className="text-sm">{mockEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length.toString().padStart(2, '0')}</Mono>
                  </div>

                  {selectedNode.type === 'STANDARD' && (
                    <Button className="mt-auto w-full uppercase" size="sm">VIEW STANDARD →</Button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-muted gap-2 opacity-50">
                  <Meta>NO NODE SELECTED</Meta>
                  <Body className="text-sm">Click a node in the graph to view its details.</Body>
                </div>
              )}
            </div>
          </div>
        }
      />
    </PageContainer>
  );
}
