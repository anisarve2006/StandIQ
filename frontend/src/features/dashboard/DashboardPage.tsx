import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Compass, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Users,
  Eye,
  Copy,
  Download,
  Check,
  X,
  FileCheck,
  ShoppingBag
} from 'lucide-react';
import { useStandIQ, type AnalyzedDocument } from '../../stores/standiq.store';
import { exportDocumentToPdf, copyDocumentOutput } from '../../services/pdfExport';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, t, documents, setActiveDocId, getDocumentBasket } = useStandIQ();

  const [selectedDocForOutput, setSelectedDocForOutput] = useState<AnalyzedDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalStandardsIdentified = documents.reduce((acc, d) => acc + (d.recommendedStandards?.length || 0), 0);
  const totalAnalyses = documents.length;
  const avgConfidence = documents.length > 0
    ? Math.round(documents.reduce((acc, d) => acc + (d.auditSummary?.complianceScore ?? 0), 0) / documents.length)
    : 0;
  const totalDepartments = new Set(documents.map(d => d.department).filter(Boolean)).size;

  const statCards = [
    {
      key: 'standardsIdentified',
      title: t('standardsIdentified'),
      value: `${totalStandardsIdentified}`,
      change: totalStandardsIdentified > 0 ? `${totalStandardsIdentified} active` : 'No data yet',
      changeType: 'neutral',
      icon: Layers,
      color: 'blue'
    },
    {
      key: 'analysesCompleted',
      title: t('analysesCompleted'),
      value: `${totalAnalyses}`,
      change: totalAnalyses > 0 ? `${totalAnalyses} completed` : '0 uploaded',
      changeType: 'neutral',
      icon: CheckCircle2,
      color: 'purple'
    },
    {
      key: 'avgMatchConfidence',
      title: t('avgMatchConfidence'),
      value: totalAnalyses > 0 ? `${avgConfidence}%` : 'N/A',
      change: totalAnalyses > 0 ? 'Verified' : 'No analyses',
      changeType: 'neutral',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      key: 'departmentsUsing',
      title: t('departmentsUsing'),
      value: `${totalDepartments}`,
      change: totalDepartments > 0 ? `${totalDepartments} active` : '0 active',
      changeType: 'neutral',
      icon: Users,
      color: 'amber'
    },
  ];

  const handleOpenDoc = (doc: AnalyzedDocument) => {
    setActiveDocId(doc.id);
    navigate('/review', { state: { selectedDocId: doc.id } });
  };

  const handleQuickCopy = async (doc: AnalyzedDocument, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await copyDocumentOutput(doc, 'spec');
    if (success) {
      showToast(`Copied tender specification output for "${doc.title.slice(0, 30)}..."!`);
    }
  };

  const handleQuickPdf = (doc: AnalyzedDocument, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const basket = getDocumentBasket(doc.id);
    exportDocumentToPdf(doc, basket);
    showToast(`Generating PDF for "${doc.title.slice(0, 30)}..."`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 01. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-orange-50/40 border border-amber-200/60 shadow-xs min-h-[190px] flex items-center">
        {/* Left Content */}
        <div className="relative z-10 p-7 md:p-8 max-w-lg lg:max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('goodMorning')}, {user.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 font-normal">
            {t('heroSubtitle')}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => navigate('/procurements/new')}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('newAnalysis')}</span>
            </button>
            <button
              onClick={() => navigate('/standards')}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs hover:shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>{t('exploreStandards')}</span>
            </button>
          </div>
        </div>

        {/* Right Image: Indian Parliament (parliament.png) */}
        <div className="absolute right-0 top-0 bottom-0 w-5/12 lg:w-1/2 hidden md:block overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/90 via-transparent to-transparent z-10 w-24" />
          <img
            src="/parliament.png"
            alt="Indian Parliament"
            className="w-full h-full object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 22%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 22%, black 100%)',
            }}
          />
        </div>
      </div>

      {/* 02. Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 03. Recent Documents & Output Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Recent Documents & Outputs</h2>
              <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200/60">
                {documents.length} Analyzed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review extracted technical specifications, Indian Standards compliance, and dedicated baskets.
            </p>
          </div>
          <Link
            to="/procurements"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>{t('viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Table */}
        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1020px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[280px]">Document Title</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[160px]">Category</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[150px]">Compliance Score</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[150px]">Basket Standards</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[120px]">Status</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[120px]">Updated</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap min-w-[170px]">Actions & Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center text-slate-500">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700 text-sm">No analyzed documents yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Upload a procurement tender or enter a specification in Review to start analyzing Indian Standards.
                    </p>
                    <Link
                      to="/review"
                      className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Analyze First Document</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const docBasket = getDocumentBasket(doc.id);
                  const score = doc.auditSummary?.complianceScore ?? 0;
                return (
                  <tr
                    key={doc.id}
                    onClick={() => handleOpenDoc(doc)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 group-hover:text-blue-600 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50/80 text-blue-600 shrink-0 group-hover:bg-blue-100/80 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-[260px]">
                          <div className="truncate font-semibold text-slate-900 group-hover:text-blue-600 leading-snug">
                            {doc.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal font-mono truncate mt-0.5">
                            {doc.fileName} • {doc.totalPages || 1} pgs
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap min-w-[160px]">
                      {doc.category || 'General Procurement'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap min-w-[150px]">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden shrink-0">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${score >= 90 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800 font-mono text-xs whitespace-nowrap">{score}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap min-w-[150px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{docBasket.length} Standards</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap min-w-[120px]">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
                          doc.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.status === 'In Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap min-w-[120px]">
                      {doc.uploadedAt}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap min-w-[170px]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {/* View Output Quick Look */}
                        <button 
                          onClick={() => setSelectedDocForOutput(doc)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                          title="View complete analysis output"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">Output</span>
                        </button>

                        {/* Quick Copy Output */}
                        <button 
                          onClick={(e) => handleQuickCopy(doc, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0"
                          title="Copy tender specification output"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Download PDF */}
                        <button 
                          onClick={(e) => handleQuickPdf(doc, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors shrink-0"
                          title="Download official PDF report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Output Quick-View Modal */}
      {selectedDocForOutput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-blue-200">
                    AI Output Analysis
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Ref: {selectedDocForOutput.tenderNumber || selectedDocForOutput.fileName}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">
                  {selectedDocForOutput.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDocForOutput.department}
                </p>
              </div>

              <button
                onClick={() => setSelectedDocForOutput(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compliance KPI Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-center">
                <div className="text-[10px] uppercase font-bold text-blue-600">Compliance Score</div>
                <div className="text-2xl font-black text-blue-900">
                  {selectedDocForOutput.auditSummary?.complianceScore ?? 100}%
                </div>
              </div>
              <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3.5 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-700">Mandatory QCO Items</div>
                <div className="text-2xl font-black text-amber-900">
                  {selectedDocForOutput.auditSummary?.mandatoryQcoItems ?? selectedDocForOutput.requirements.filter(r => r.severity === 'High').length}
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-700">Dedicated Basket</div>
                <div className="text-2xl font-black text-emerald-900">
                  {getDocumentBasket(selectedDocForOutput.id).length} Standards
                </div>
              </div>
            </div>

            {/* Extracted Requirements Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Extracted Requirements ({selectedDocForOutput.requirements.length})</span>
              </h4>
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto border border-slate-200/70 text-xs">
                {selectedDocForOutput.requirements.map((req, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="font-mono text-slate-400">#{req.clauseNumber || i+1}</span>
                        <span>{req.title}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{req.requirementText}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {req.recommendedStandard}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Standards Matrix Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Applicable Indian Standards ({selectedDocForOutput.recommendedStandards.length})</span>
              </h4>
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto border border-slate-200/70 text-xs">
                {selectedDocForOutput.recommendedStandards.map((std, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900">{std.code}</span>
                      <div className="text-slate-600 text-[11px] truncate">{std.title}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        {std.match}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleQuickCopy(selectedDocForOutput);
                  }}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Tender Specification</span>
                </button>

                <button
                  onClick={() => {
                    handleQuickPdf(selectedDocForOutput);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Convert to PDF</span>
                </button>
              </div>

              <button
                onClick={() => {
                  handleOpenDoc(selectedDocForOutput);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Open Full Review Workspace →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
