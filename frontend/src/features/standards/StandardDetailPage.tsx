import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Share2, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { ALL_STANDARDS, type StandardItem } from './StandardsDiscoveryPage';

const EXTENDED_DETAILS: Record<string, {
  scope: string;
  keyClauses: { clause: string; title: string; desc: string }[];
  normativeReferences: string[];
  mandatoryQco: boolean;
  qcoTitle?: string;
  division: string;
  committee: string;
}> = {
  'IS 12615:2018': {
    scope: 'This standard specifies requirements and performance values for three-phase line-operated energy efficient induction motors, conforming to efficiency classes IE2, IE3 and IE4, for output ratings from 0.12 kW up to and including 1000 kW.',
    keyClauses: [
      { clause: 'Clause 4.1', title: 'Operating Conditions', desc: 'Rated for altitudes up to 1000m and ambient temperature range -20°C to +50°C.' },
      { clause: 'Clause 6.2', title: 'Efficiency Classes', desc: 'Mandates minimum full-load and 75% load efficiency values conforming to IE3 specifications.' },
      { clause: 'Clause 7.3', title: 'Determination of Efficiency', desc: 'Loss summation test method in accordance with IS 8789 / IEC 60034-2-1.' },
      { clause: 'Clause 9.1', title: 'Tolerances & Rating Plate', desc: 'Efficiency tolerance shall be -15% of (1 - η) for motors up to 150 kW.' }
    ],
    normativeReferences: ['IS 325:1996', 'IS 8789:1981', 'IS 302:2008', 'IS 9383:1997', 'IS 13065:1987'],
    mandatoryQco: true,
    qcoTitle: 'Electrical Motors (Quality Control) Order, 2024 - Mandatory BIS Certification',
    division: 'Electrotechnical Division Council',
    committee: 'Rotating Machinery Sectional Committee (ETD 15)'
  },
  'IS 325:1996': {
    scope: 'This standard covers three-phase induction motors for voltages up to and including 11 000 V having windings with Class A, Class E, Class B, Class F or Class H insulation.',
    keyClauses: [
      { clause: 'Clause 3.2', title: 'Standard Ratings', desc: 'Preferred rated outputs and corresponding mechanical frame assignments.' },
      { clause: 'Clause 5.1', title: 'Terminal Markings', desc: 'Terminal markings and direction of rotation for standard phase sequences.' },
      { clause: 'Clause 8.4', title: 'Dielectric High Voltage Test', desc: '1000 V + 2 x rated voltage applied for 60 seconds.' }
    ],
    normativeReferences: ['IS 12615:2018', 'IS 8789:1981', 'IS 302:2008'],
    mandatoryQco: true,
    qcoTitle: 'Three-Phase Motors Standard Regulation Notice',
    division: 'Electrotechnical Division Council',
    committee: 'ETD 15'
  },
  'IS 8789:1981': {
    scope: 'Prescribes methods of testing for determining efficiency and loss components of polyphase induction motors by summation of losses method.',
    keyClauses: [
      { clause: 'Clause 3.1', title: 'Loss Separation', desc: 'Determination of iron losses, windage, friction, and stator/rotor I²R losses.' },
      { clause: 'Clause 5.2', title: 'Stray Load Loss Calculation', desc: 'Measurement of load losses at varying ambient and winding temperatures.' }
    ],
    normativeReferences: ['IS 12615:2018', 'IS 325:1996'],
    mandatoryQco: false,
    division: 'Electrotechnical Division Council',
    committee: 'ETD 15'
  }
};

export default function StandardDetailPage() {
  const navigate = useNavigate();
  const { standardId } = useParams();
  const { addToBasket, removeFromBasket, isInBasket } = useStandIQ();
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'references' | 'history'>('overview');

  // Decode standard ID (e.g. "IS 12615:2018" or "is-12615-2018")
  const decodedId = decodeURIComponent(standardId || '');
  const standard: StandardItem = ALL_STANDARDS.find(
    s => s.code.toLowerCase() === decodedId.toLowerCase() || 
         s.id.toLowerCase() === decodedId.toLowerCase() ||
         s.code.replace(/[: ]/g, '-').toLowerCase() === decodedId.toLowerCase()
  ) || {
    id: decodedId,
    code: decodedId.toUpperCase().includes('IS') ? decodedId.toUpperCase() : `IS ${decodedId}`,
    title: 'Indian Standard Technical Specification',
    status: 'Current',
    type: 'Product',
    industry: 'Electrical',
    tags: ['Indian Standard', 'Technical Specification', 'BIS Certified'],
    reaffirmed: 2023,
    relatedCount: 5,
    year: 2020
  };

  const details = EXTENDED_DETAILS[standard.code] || {
    scope: `This standard specifies Indian national technical requirements, tolerances, and quality criteria for ${standard.title}. It serves as the normative benchmark for public procurement and regulatory compliance.`,
    keyClauses: [
      { clause: 'Clause 1.0', title: 'Scope and Field of Application', desc: 'Defines applicability and operational limits for standard compliant hardware.' },
      { clause: 'Clause 4.0', title: 'General Requirements', desc: 'Material selection, manufacturing quality, and environmental endurance bounds.' },
      { clause: 'Clause 7.0', title: 'Sampling and Acceptance Criteria', desc: 'Sampling procedures and batch verification protocols.' }
    ],
    normativeReferences: ['IS 12615:2018', 'IS 325:1996', 'IS 302:2008'],
    mandatoryQco: true,
    qcoTitle: 'Ministry of Heavy Industries Quality Control Order',
    division: 'Electrotechnical Division Council',
    committee: 'Sectional Committee ETD'
  };

  const inBasket = isInBasket(standard.code);

  const handleToggleBasket = () => {
    if (inBasket) {
      removeFromBasket(standard.code);
    } else {
      addToBasket({
        id: standard.code,
        code: standard.code,
        title: standard.title,
        type: standard.type,
        status: standard.status,
        year: standard.year,
        reaffirmedYear: standard.reaffirmed,
        relatedCount: standard.relatedCount,
        tags: standard.tags
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Breadcrumb and Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/standards')}
          className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Standards Explorer</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/standards" className="hover:text-slate-600">Standards</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono text-slate-800 font-bold">{standard.code}</span>
        </div>
      </div>

      {/* 02. Header Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
              {standard.code}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {standard.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              {standard.type} Standard
            </span>
            {details.mandatoryQco && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mandatory QCO</span>
              </span>
            )}
          </div>

          <h1 className="text-base sm:text-lg font-bold text-slate-800">
            {standard.title}
          </h1>

          <p className="text-xs text-slate-500 font-mono">
            Published Year: {standard.year} | Reaffirmed: {standard.reaffirmed} | Division: {details.division}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {standard.tags.map((t, idx) => (
              <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={handleToggleBasket}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
              inBasket
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {inBasket ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">In Standards Basket</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">Add to Basket</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/graph')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">View Knowledge Graph</span>
          </button>

          <button
            onClick={() => navigate('/specification-builder')}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">Use in Specification</span>
          </button>
        </div>
      </div>

      {/* 03. Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-0.5 scrollbar-none">
        {[
          { key: 'overview', label: 'Overview & Scope' },
          { key: 'clauses', label: 'Key Clauses', count: details.keyClauses.length },
          { key: 'references', label: 'Normative References', count: details.normativeReferences.length },
          { key: 'history', label: 'Version Timeline' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 pt-1 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0 ${
                activeTab === tab.key ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 04. Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Scope of Standard</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl bg-slate-50 p-4 rounded-xl border border-slate-100">
                {details.scope}
              </p>
            </div>

            {details.qcoTitle && (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-purple-900">Mandatory Quality Control Enforcement</h3>
                  <p className="text-xs text-purple-800 leading-relaxed">{details.qcoTitle}</p>
                  <p className="text-[11px] text-purple-700 font-mono pt-1">
                    Bidders in public tenders must possess a valid BIS license to manufacture/supply products conforming to this standard.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Supervising Committee</span>
                <p className="text-xs font-semibold text-slate-800">{details.committee}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable Industry</span>
                <p className="text-xs font-semibold text-slate-800">{standard.industry} Engineering</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clauses' && (
          <div className="space-y-3.5">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Critical Tender Clauses</h2>
            {details.keyClauses.map((c, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {c.clause}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
                </div>
                <p className="text-xs text-slate-600 pl-1 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'references' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Normative References & Allied Standards</h2>
            <p className="text-xs text-slate-500">Standards required to test, inspect or operate in conjunction with {standard.code}:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {details.normativeReferences.map((ref) => (
                <div 
                  key={ref}
                  onClick={() => navigate(`/standards/${ref}`)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-orange-600 block">{ref}</span>
                      <span className="text-[11px] text-slate-400">Allied Indian Standard</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900">Publication & Revision History</h2>
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{standard.year} Edition (Current)</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">Active</span>
                  </div>
                  <p className="text-xs text-slate-600">Reaffirmed in {standard.reaffirmed}. Includes Amendment 1 & 2 incorporating IE3 efficiency band.</p>
                </div>
              </div>

              <div className="relative pt-3">
                <span className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-slate-300" />
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-slate-500">2011 Edition (Superseded)</span>
                  <p className="text-xs text-slate-500">Prior standard revision baseline for energy efficient machines.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
