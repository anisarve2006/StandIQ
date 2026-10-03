import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  BookOpen, 
  Plus, 
  ChevronRight,
  Scale,
  Sparkles
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface EvidenceItem {
  id: string;
  standardId: string;
  standardTitle: string;
  clause: string;
  page: number;
  excerpt: string;
  verificationStatus: 'VERIFIED' | 'REVIEW' | 'FLAGGED';
  evidenceType: 'QCO_MANDATE' | 'DIRECT_REQUIREMENT' | 'TECHNICAL_CLAUSE' | 'CVC_RESTRICTION';
  confidenceScore: number;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  qcoReference?: string;
  statutoryRule?: string;
  recommendedAction?: string;
}

const DEFAULT_SAMPLE_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-sample-1',
    standardId: 'IS 1786:2008',
    standardTitle: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement',
    clause: 'Clause 4.2 & Cl 8.1',
    page: 14,
    excerpt: 'All high strength deformed steel rebar for RCC superstructure and bridge pier caps shall conform to Grade Fe 500D. Tensile strength, yield stress, and total elongation at maximum force must be certified by an approved BIS licensee.',
    verificationStatus: 'VERIFIED',
    evidenceType: 'QCO_MANDATE',
    confidenceScore: 99,
    category: 'Structural Civil Engineering',
    severity: 'Critical',
    qcoReference: 'Steel and Steel Products (Quality Control) Order, S.O. 1285(E)',
    statutoryRule: 'Mandatory BIS Certification Scheme I under Section 16 BIS Act 2016',
    recommendedAction: 'Mandate BIS ISI Mark on every rebar bundle. Restrict delivery without manufacturer test certificate conforming to IS 1608.'
  },
  {
    id: 'ev-sample-2',
    standardId: 'IS 12615:2018',
    standardTitle: 'Energy Efficient Induction Motors — Three Phase Squrel Cage',
    clause: 'Clause 5.1 & Cl 7.3',
    page: 22,
    excerpt: 'Three-phase squirrel cage induction motors 15 kW rated for continuous duty S1. Minimum efficiency class shall be IE3 (Premium Efficiency) determined as per IS 8789 loss summation method.',
    verificationStatus: 'VERIFIED',
    evidenceType: 'QCO_MANDATE',
    confidenceScore: 96,
    category: 'Electrical Equipment',
    severity: 'High',
    qcoReference: 'Electric Motors (Quality Control) Order, Ministry of Heavy Industries',
    statutoryRule: 'BEE Energy Conservation Act & GFR 2017 Rule 144(i)',
    recommendedAction: 'Verify IE3 nameplate marking and BIS License No. CM/L prior to technical tender admission.'
  },
  {
    id: 'ev-sample-3',
    standardId: 'IS 269:2015',
    standardTitle: 'Ordinary Portland Cement — Specification (Sixth Revision)',
    clause: 'Clause 6.1 (Chemical & Physical)',
    page: 8,
    excerpt: 'Ordinary Portland Cement 43 Grade conforming to IS 8112:2013 for foundation concrete work. Manufacturer must provide weekly test results.',
    verificationStatus: 'REVIEW',
    evidenceType: 'TECHNICAL_CLAUSE',
    confidenceScore: 84,
    category: 'Construction Materials',
    severity: 'Medium',
    qcoReference: 'Cement (Quality Control) Order, DPIIT',
    statutoryRule: 'Superseded Standard Notification — IS 8112 merged into unified IS 269:2015',
    recommendedAction: 'Update tender clause from IS 8112:2013 to IS 269:2015 (incorporating 33, 43, and 53 grades) to prevent CAG audit scrutiny.'
  },
  {
    id: 'ev-sample-4',
    standardId: 'IS 14286:2010',
    standardTitle: 'Crystalline Silicon Terrestrial Photovoltaic (PV) Modules',
    clause: 'Clause 10.1 (Design Qualification)',
    page: 31,
    excerpt: 'Solar PV modules shall have minimum 540 Wp rating with manufacturer ALMM enlistment. Standard commercial warranty of 10 years without BIS CRS registration.',
    verificationStatus: 'FLAGGED',
    evidenceType: 'CVC_RESTRICTION',
    confidenceScore: 92,
    category: 'Renewable Energy',
    severity: 'Critical',
    qcoReference: 'Solar Photovoltaics, Systems, Devices and Components Goods QCO',
    statutoryRule: 'MNRE Mandatory Order & BIS Compulsory Registration Scheme (CRS)',
    recommendedAction: 'Immediate amendment required: Instate compulsory BIS CRS registration under IS 14286 & IS 61730. Commercial waiver violates Section 16 BIS Act.'
  }
];

export default function EvidenceViewerPage() {
  const navigate = useNavigate();
  const { activeDocument, addToBasket, isInBasket, basket } = useStandIQ();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Derive evidence items from active document or fallback to high-quality sample evidence
  const dynamicEvidenceList: EvidenceItem[] = (activeDocument?.requirements && activeDocument.requirements.length > 0)
    ? activeDocument.requirements.map((req, idx) => ({
        id: `ev-${req.id || idx + 1}`,
        standardId: req.recommendedStandard || activeDocument.tenderNumber || `Clause ${req.clauseNumber || idx + 1}`,
        standardTitle: req.title || `Requirement ${req.clauseNumber || idx + 1}`,
        clause: req.clauseNumber ? `Clause ${req.clauseNumber}` : `Section 1.${idx + 1}`,
        page: 1,
        excerpt: req.requirementText,
        verificationStatus: req.status === 'accepted' ? 'VERIFIED' : req.severity === 'High' ? 'FLAGGED' : 'REVIEW',
        evidenceType: req.isMandatoryQco ? 'QCO_MANDATE' : 'DIRECT_REQUIREMENT',
        confidenceScore: req.confidenceScore || (req.severity === 'High' ? 95 : 82),
        category: req.category || 'General Procurement',
        severity: (req.severity as any) || 'Medium',
        qcoReference: req.isMandatoryQco ? 'Live Bureau of Indian Standards QCO Notification' : 'GFR 2017 Technical Scope',
        statutoryRule: 'Rule 144(i) of General Financial Rules, 2017',
        recommendedAction: req.rationale || 'Enforce designated Indian Standard certification mark.'
      }))
    : DEFAULT_SAMPLE_EVIDENCE;

  const filteredEvidence = dynamicEvidenceList.filter(item => {
    if (filterType === 'ALL') return true;
    return item.verificationStatus === filterType;
  });

  const selectedEvidence = filteredEvidence[selectedIndex] || filteredEvidence[0] || dynamicEvidenceList[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddToBasket = (item: EvidenceItem) => {
    addToBasket({
      id: item.standardId,
      code: item.standardId,
      title: item.standardTitle,
      type: 'Product',
      status: 'Current',
      mandatory: item.evidenceType === 'QCO_MANDATE'
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Breadcrumb & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <button 
            onClick={() => navigate('/review')} 
            className="hover:text-slate-600 transition-colors cursor-pointer"
          >
            Review
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Statutory Compliance &amp; Evidence</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compliance &amp; Evidence Viewer</h1>
              <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200/80">
                Live Ground Truth
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect clause-by-clause tender excerpts linked directly to mandatory BIS Quality Control Orders and statutory citations.
            </p>
          </div>

          {activeDocument ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
              <span className="text-slate-400 font-medium">Active:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{activeDocument.title}</span>
            </div>
          ) : (
            <div className="bg-orange-50/70 border border-orange-200/70 rounded-xl px-3 py-1 flex items-center gap-2 text-xs text-orange-800 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-medium">Demonstration Sample Corpus Loaded</span>
            </div>
          )}
        </div>
      </div>

      {/* 02. Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Evidence', count: dynamicEvidenceList.length },
            { id: 'VERIFIED', label: 'Verified QCO', count: dynamicEvidenceList.filter(e => e.verificationStatus === 'VERIFIED').length },
            { id: 'REVIEW', label: 'Needs Review', count: dynamicEvidenceList.filter(e => e.verificationStatus === 'REVIEW').length },
            { id: 'FLAGGED', label: 'Flagged / Breach', count: dynamicEvidenceList.filter(e => e.verificationStatus === 'FLAGGED').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === tab.id
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterType === tab.id ? 'bg-orange-500/80 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono pr-2">
          Showing {filteredEvidence.length} of {dynamicEvidenceList.length} clauses
        </div>
      </div>

      {/* 03. Split View: Left List + Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Evidence Excerpts List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredEvidence.map((item, idx) => {
            const isSelected = selectedEvidence?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs space-y-2.5 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{item.standardId}</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.clause}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    item.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.verificationStatus === 'REVIEW'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.verificationStatus}
                  </span>
                </div>

                {/* Excerpt Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  &quot;{item.excerpt}&quot;
                </p>

                {/* Card Bottom Meta */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-100">
                  <span className="truncate max-w-[180px]">{item.category}</span>
                  <div className="flex items-center gap-1 text-slate-600 font-mono font-semibold">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>{item.confidenceScore}% match</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Evidence Ground Truth Inspector (7 Cols) */}
        {selectedEvidence && (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6 sticky top-6">
            
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {selectedEvidence.standardId}
                  </h2>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                    selectedEvidence.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedEvidence.verificationStatus === 'REVIEW'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedEvidence.verificationStatus}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 leading-snug">
                  {selectedEvidence.standardTitle}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyText(selectedEvidence.excerpt, selectedEvidence.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-semibold"
                  title="Copy Excerpt"
                >
                  {copiedId === selectedEvidence.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selectedEvidence.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Source Tender Excerpt Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  <span>Audited Tender Clause Excerpt ({selectedEvidence.clause})</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">Page {selectedEvidence.page}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-orange-500 text-xs font-mono text-slate-800 leading-relaxed">
                &quot;{selectedEvidence.excerpt}&quot;
              </div>
            </div>

            {/* Statutory Grounding & QCO Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mandatory QCO Grounding
                </span>
                <p className="font-bold text-slate-800 leading-snug">
                  {selectedEvidence.qcoReference || 'BIS Mandatory Quality Control Order'}
                </p>
                <span className="text-[10px] text-slate-500 block pt-0.5">
                  Enforceable under BIS Act Section 16 &amp; 17
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Statutory Rule Reference
                </span>
                <p className="font-bold text-slate-800 leading-snug">
                  {selectedEvidence.statutoryRule || 'GFR 2017 Rule 144(i)'}
                </p>
                <span className="text-[10px] text-slate-500 block pt-0.5">
                  Public Procurement Mandate
                </span>
              </div>
            </div>

            {/* Recommended Legal Remediation */}
            {selectedEvidence.recommendedAction && (
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-orange-800 text-xs font-bold">
                  <Scale className="w-4 h-4 text-orange-600" />
                  <span>Legal &amp; Technical Auditor Advice</span>
                </div>
                <p className="text-xs text-orange-950 leading-relaxed font-medium">
                  {selectedEvidence.recommendedAction}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => navigate(`/standards/${selectedEvidence.standardId}`)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Explore Standard</span>
                </button>
                <button
                  onClick={() => navigate('/tender-health')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dispute Risk Audit</span>
                </button>
              </div>

              <button
                onClick={() => handleAddToBasket(selectedEvidence)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                  isInBasket(selectedEvidence.standardId)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isInBasket(selectedEvidence.standardId) ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>In Watchlist ({basket.length})</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add to Standards Basket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
