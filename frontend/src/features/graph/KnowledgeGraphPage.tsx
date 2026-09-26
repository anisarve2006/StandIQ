import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Plus, 
  ExternalLink,
  Shield,
  BookOpen,
  FileCode2,
  Share2
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface GraphNode {
  id: string;
  code: string;
  name: string;
  category: 'Main Standard' | 'Allied Standard' | 'Normative Reference' | 'Related Standard' | 'Certification';
  x: number;
  y: number;
  color: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  relationship: string;
  relationshipTag: string;
  description: string;
  clauseRef?: string;
  mandatory?: boolean;
}

const CENTER_NODE: GraphNode = {
  id: 'is-12615',
  code: 'IS 12615:2018',
  name: 'Main Standard',
  category: 'Main Standard',
  x: 380,
  y: 260,
  color: '#2563eb',
  cardBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  cardBorder: '#1e40af',
  badgeBg: '#dbeafe',
  badgeText: '#1e40af',
  relationship: 'Root procurement specification standard for electric motors',
  relationshipTag: 'Root Specification',
  description: 'Energy efficient induction motors (three-phase) — Mandatory baseline standard for public procurement under Government of India Quality Control Orders (QCO 2024).',
  clauseRef: 'Clause 1 to 14 (Mandatory IE3 baseline)',
  mandatory: true
};

const SATELLITE_NODES: GraphNode[] = [
  {
    id: 'is-325',
    code: 'IS 325:1996',
    name: 'Product Standard',
    category: 'Allied Standard',
    x: 380,
    y: 80,
    color: '#0284c7', // Sky Blue
    cardBg: '#f0f9ff',
    cardBorder: '#bae6fd',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    relationship: 'Specification for Three-Phase Induction Motors',
    relationshipTag: 'General Specifications',
    description: 'Defines general performance characteristics, dimensional boundaries, terminal designations, and mechanical ratings.',
    clauseRef: 'Ref Clause 4.1 & Clause 5.0'
  },
  {
    id: 'is-8789',
    code: 'IS 8789:1981',
    name: 'Testing Standard',
    category: 'Related Standard',
    x: 590,
    y: 150,
    color: '#10b981', // Emerald
    cardBg: '#ecfdf5',
    cardBorder: '#a7f3d0',
    badgeBg: '#d1fae5',
    badgeText: '#047857',
    relationship: 'Method of Test for Efficiency of Induction Motors',
    relationshipTag: 'Efficiency Test Method',
    description: 'Prescribes precise test procedures for determining efficiency and loss components through loss summation method.',
    clauseRef: 'Ref Clause 7.3 (Loss Summation)'
  },
  {
    id: 'is-9383',
    code: 'IS 9383:1997',
    name: 'Installation Standard',
    category: 'Related Standard',
    x: 590,
    y: 370,
    color: '#8b5cf6', // Purple
    cardBg: '#f5f3ff',
    cardBorder: '#ddd6fe',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    relationship: 'Installation of Electrical Equipment in Hazardous Areas',
    relationshipTag: 'Site Installation Code',
    description: 'Specifies mounting, vibration isolation, ventilation clearances, and hazardous environment installation codes.',
    clauseRef: 'Ref Clause 9.2 (Hazardous Areas)'
  },
  {
    id: 'bis-crs',
    code: 'BIS Certification',
    name: 'CRS Requirement',
    category: 'Certification',
    x: 380,
    y: 440,
    color: '#06b6d4', // Cyan
    cardBg: '#ecfeff',
    cardBorder: '#a5f3fc',
    badgeBg: '#cffafe',
    badgeText: '#0e7490',
    relationship: 'Compulsory Registration Scheme (CRS)',
    relationshipTag: 'Mandatory QCO Order',
    description: 'Ministry of Heavy Industries statutory order mandating valid BIS ISI mark license and CRS registration certificate.',
    clauseRef: 'QCO Order 2024 (Mandatory)',
    mandatory: true
  },
  {
    id: 'is-302',
    code: 'IS 302:2008',
    name: 'Safety Standard',
    category: 'Normative Reference',
    x: 170,
    y: 370,
    color: '#f43f5e', // Rose/Coral
    cardBg: '#fff1f2',
    cardBorder: '#fecdd3',
    badgeBg: '#ffe4e6',
    badgeText: '#be123c',
    relationship: 'Safety of Electrical Equipment',
    relationshipTag: 'Dielectric & Thermal Safety',
    description: 'Prescribes protective insulation, creepage distances, earthing terminals, and dielectric breakdown testing boundaries.',
    clauseRef: 'Ref Clause 8.1 (High Voltage Test)',
    mandatory: true
  },
  {
    id: 'is-13065',
    code: 'IS 13065:1987',
    name: 'Terminology Standard',
    category: 'Allied Standard',
    x: 170,
    y: 150,
    color: '#f59e0b', // Amber
    cardBg: '#fffbeb',
    cardBorder: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
    relationship: 'Vocabulary for Rotating Electrical Machines',
    relationshipTag: 'Harmonized Terminology',
    description: 'Harmonized technical terminology, definitions, and symbol classification across tender documentation and manufacturer bids.',
    clauseRef: 'Ref Clause 2.0 (Terminology)'
  }
];

const ALL_NODES: GraphNode[] = [CENTER_NODE, ...SATELLITE_NODES];

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const { addToBasket, removeFromBasket, isInBasket } = useStandIQ();
  const svgRef = useRef<SVGSVGElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode>(CENTER_NODE);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const categories = [
    'All',
    'Main Standard',
    'Allied Standard',
    'Normative Reference',
    'Related Standard',
    'Certification'
  ];

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.75), 1.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setSelectedNode(CENTER_NODE);
    setSearchQuery('');
    setActiveCategoryFilter('All');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const match = ALL_NODES.find(n => 
      n.code.toLowerCase().includes(q) || 
      n.name.toLowerCase().includes(q) || 
      n.relationship.toLowerCase().includes(q) ||
      n.relationshipTag.toLowerCase().includes(q)
    );
    if (match) {
      setSelectedNode(match);
    }
  };

  const isNodeDimmed = (node: GraphNode) => {
    if (activeCategoryFilter !== 'All' && node.category !== activeCategoryFilter && node.id !== CENTER_NODE.id) {
      return true;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = node.code.toLowerCase().includes(q) || 
                    node.name.toLowerCase().includes(q) || 
                    node.relationship.toLowerCase().includes(q) ||
                    node.relationshipTag.toLowerCase().includes(q);
      if (!match) return true;
    }
    return false;
  };

  const inBasket = isInBasket(selectedNode.code);

  const handleToggleBasket = (node: GraphNode) => {
    if (isInBasket(node.code)) {
      removeFromBasket(node.code);
    } else {
      addToBasket({
        id: node.code,
        code: node.code,
        title: node.relationship,
        type: node.category === 'Certification' ? 'Product' : node.category === 'Related Standard' ? 'Testing' : 'Product',
        status: 'Current',
        mandatory: node.mandatory
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5">
      {/* 01. Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Standards Relationship Graph</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Visualize relationships between standards, references and allied documents.
        </p>
      </div>

      {/* 02. Top Control Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search standards in graph (e.g. IS 8789, Testing, CRS)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => handleZoom(0.1)}
                className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showFilters || activeCategoryFilter !== 'All'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters {activeCategoryFilter !== 'All' ? `(${activeCategoryFilter})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs shadow-2xs animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  activeCategoryFilter === cat
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 03. Side-by-Side: Complete Graph on Left + Detailed Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: The Complete Graph (col-span-7 or 8) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Top Canvas Bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-bold text-slate-800">Target Standard Network</span>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">| 6 Interlinked Dependencies</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* SVG Canvas Area */}
          <div 
            className="w-full h-[520px] overflow-hidden relative select-none flex items-center justify-center"
            style={{
              backgroundImage: `radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)`,
              backgroundSize: '24px 24px'
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 760 520"
              className="w-full h-full transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.08" />
                </filter>
                <filter id="center-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#2563eb" floodOpacity="0.25" />
                </filter>
                <linearGradient id="center-node-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* Connecting Lines */}
              {SATELLITE_NODES.map((node) => {
                const dimmed = isNodeDimmed(node);
                const isSelected = selectedNode.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const isHighlighted = isSelected || isHovered;

                // Calculate midpoint
                const midX = (CENTER_NODE.x + node.x) / 2;
                const midY = (CENTER_NODE.y + node.y) / 2;

                return (
                  <g key={`edge-${node.id}`} opacity={dimmed ? 0.2 : 1} className="transition-opacity duration-200">
                    {/* Base Edge */}
                    <line
                      x1={CENTER_NODE.x}
                      y1={CENTER_NODE.y}
                      x2={node.x}
                      y2={node.y}
                      stroke={isHighlighted ? node.color : '#cbd5e1'}
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeDasharray={node.category === 'Certification' ? '5 4' : 'none'}
                      className="transition-all duration-200"
                    />

                    {/* Animated Traveling Pulse */}
                    <circle r={isHighlighted ? 3.5 : 2.5} fill={node.color}>
                      <animateMotion
                        path={`M ${CENTER_NODE.x} ${CENTER_NODE.y} L ${node.x} ${node.y}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Midpoint Interactive Relationship Tag */}
                    <g 
                      transform={`translate(${midX}, ${midY})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <rect
                        x={-45}
                        y={-10}
                        width={90}
                        height={20}
                        rx={10}
                        fill="#ffffff"
                        stroke={isHighlighted ? node.color : '#e2e8f0'}
                        strokeWidth={1.5}
                        filter="url(#card-shadow)"
                        className="transition-colors"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        className="text-[9px] font-sans font-bold fill-slate-600 select-none pointer-events-none"
                      >
                        {node.relationshipTag}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Satellite Node Cards */}
              {SATELLITE_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const dimmed = isNodeDimmed(node);

                const cardW = 140;
                const cardH = 44;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer group"
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={dimmed ? 0.25 : 1}
                  >
                    {/* Active Selection Ring */}
                    {isSelected && (
                      <rect
                        x={-(cardW / 2) - 4}
                        y={-(cardH / 2) - 4}
                        width={cardW + 8}
                        height={cardH + 8}
                        rx={14}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Node Capsule Background */}
                    <rect
                      x={-(cardW / 2)}
                      y={-(cardH / 2)}
                      width={cardW}
                      height={cardH}
                      rx={10}
                      fill={node.cardBg}
                      stroke={isSelected || isHovered ? node.color : node.cardBorder}
                      strokeWidth={isSelected || isHovered ? 2 : 1.5}
                      filter="url(#card-shadow)"
                      className="transition-all duration-150 group-hover:scale-105"
                    />

                    {/* Standard Code Header */}
                    <text
                      textAnchor="middle"
                      dy="-3"
                      className="font-mono font-bold text-[11px] fill-slate-900 group-hover:fill-blue-700 transition-colors"
                    >
                      {node.code}
                    </text>

                    {/* Standard Role Subtitle */}
                    <text
                      textAnchor="middle"
                      dy="11"
                      className="font-sans font-semibold text-[9px]"
                      fill={node.color}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}

              {/* Center Main Standard Node */}
              <g
                onClick={() => setSelectedNode(CENTER_NODE)}
                onMouseEnter={() => setHoveredNode(CENTER_NODE)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
                transform={`translate(${CENTER_NODE.x}, ${CENTER_NODE.y})`}
                opacity={isNodeDimmed(CENTER_NODE) ? 0.4 : 1}
              >
                {/* Outer Pulsing Aura Ring */}
                <circle
                  r={58}
                  fill="#dbeafe"
                  opacity="0.5"
                  className="animate-pulse"
                />

                {/* Main Concentric Circle */}
                <circle
                  r={48}
                  fill="url(#center-node-grad)"
                  stroke="#1d4ed8"
                  strokeWidth={2.5}
                  filter="url(#center-glow)"
                  className="group-hover:scale-105 transition-transform"
                />

                {/* Center Standard Code */}
                <text
                  textAnchor="middle"
                  dy="-4"
                  className="font-mono font-extrabold text-[12.5px] fill-white tracking-tight"
                >
                  {CENTER_NODE.code}
                </text>

                {/* Center Subtitle */}
                <text
                  textAnchor="middle"
                  dy="12"
                  className="font-sans font-bold text-[9px] fill-blue-100 uppercase tracking-wider"
                >
                  {CENTER_NODE.name}
                </text>
              </g>
            </svg>
          </div>

          {/* Bottom Legend Matching Reference Design */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100" />
              <span className="font-semibold text-slate-700">Main Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-100" />
              <span className="font-semibold text-slate-700">Allied Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
              <span className="font-semibold text-slate-700">Normative Reference</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-100" />
              <span className="font-semibold text-slate-700">Related Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-100" />
              <span className="font-semibold text-slate-700">Certification</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dedicated Detailed Info Panel (col-span-5 or 4) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header with Badges */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span 
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{ 
                    backgroundColor: selectedNode.badgeBg, 
                    color: selectedNode.badgeText, 
                    borderColor: selectedNode.cardBorder 
                  }}
                >
                  {selectedNode.category}
                </span>

                {selectedNode.mandatory && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    <Shield className="w-3 h-3" />
                    <span>Mandatory QCO</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {selectedNode.code}
                </h2>
                {selectedNode.id !== CENTER_NODE.id && (
                  <button
                    onClick={() => navigate(`/standards/${selectedNode.code}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Open Full Standard Document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-600 mt-1">{selectedNode.name}</p>
            </div>

            {/* Relationship Callout */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Share2 className="w-3 h-3 text-blue-600" />
                <span>Relationship to Procurement</span>
              </span>
              <p className="text-xs font-bold text-slate-800 leading-snug">{selectedNode.relationship}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-mono">
                Tag: {selectedNode.relationshipTag}
              </span>
            </div>

            {/* Technical Scope & Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Standard Scope & Field of Application
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-white">
                {selectedNode.description}
              </p>
            </div>

            {/* Referenced Clauses */}
            {selectedNode.clauseRef && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Referenced Clauses in Specification
                </span>
                <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono text-xs font-bold text-blue-900">
                    {selectedNode.clauseRef}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Node Switcher Strip */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                All Linked Standards ({ALL_NODES.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_NODES.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
                      selectedNode.id === n.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {n.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => handleToggleBasket(selectedNode)}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
                inBasket
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {inBasket ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Saved in Standards Basket</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add to Standards Basket</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => navigate(`/standards/${selectedNode.code}`)}
                className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Open Standard</span>
              </button>

              <button
                onClick={() => navigate('/specification-builder')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Use in Spec</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
