import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Compass, 
  ArrowUpRight, 
  FileText, 
  ShieldCheck, 
  Eye,
  Copy,
  Download,
  Check,
  X,
  LayoutGrid,
  List,
  Search,
  AlertTriangle,
  Clock,
  Bell,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { useStandIQ, type AnalyzedDocument } from '../../stores/standiq.store';
import { exportDocumentToPdf, copyDocumentOutput } from '../../services/pdfExport';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, t, documents, setActiveDocId, getDocumentBasket } = useStandIQ();

  const [selectedDocForOutput, setSelectedDocForOutput] = useState<AnalyzedDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Completed' | 'In Review'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocs = documents.filter((doc) => {
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchCat = (doc.category || '').toLowerCase().includes(q);
      const matchFile = (doc.fileName || '').toLowerCase().includes(q);
      const docBasket = getDocumentBasket(doc.id);
      const matchStd = docBasket.some(s => s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
      return matchTitle || matchCat || matchFile || matchStd;
    }
    return true;
  });

  const handleOpenDoc = (doc: AnalyzedDocument) => {
    setActiveDocId(doc.id);
    navigate('/review', { state: { selectedDocId: doc.id } });
  };

  const handleQuickCopy = async (doc: AnalyzedDocument, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await copyDocumentOutput(doc, 'spec');
    if (success) {
      showToast(`Copied tender specification for "${doc.title.slice(0, 30)}..."!`);
    }
  };

  const handleQuickPdf = (doc: AnalyzedDocument, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const basket = getDocumentBasket(doc.id);
    exportDocumentToPdf(doc, basket);
    showToast(`Generating PDF for "${doc.title.slice(0, 30)}..."`);
  };

  // Actionable items for "Needs Attention"
  const attentionItems = [
    {
      id: 'att-1',
      title: 'Ordinary Portland Cement 43 Grade has 22% unresolved compliance requirements',
      subtitle: 'Housing Infrastructure • Missing IS 8112 mandatory compressive strength limits',
      severity: 'warning' as const,
      docId: 'doc-cement-43',
      actionLabel: 'Review',
      actionPath: '/review',
    },
    {
      id: 'att-2',
      title: '3 standards updated recently by Bureau of Indian Standards (BIS)',
      subtitle: 'Gazette notification affects IS 12615:2018 (Energy Efficient Motors) with IE3 class',
      severity: 'info' as const,
      actionLabel: 'View Alert',
      actionPath: '/changes',
    },
    {
      id: 'att-3',
      title: 'Fe 500D TMT Steel Rebars pending mandatory statutory QCO verification',
      subtitle: 'Highway Overpass Package 2 • Steel & Steel Products Quality Control Order',
      severity: 'urgent' as const,
      docId: 'doc-tmt-500d',
      actionLabel: 'Verify',
      actionPath: '/review',
    },
    {
      id: 'att-4',
      title: '2 tenders require technical clause review before GeM publication',
      subtitle: '415V Low Voltage Switchgear & Solar PV Inverter specification drafts',
      severity: 'neutral' as const,
      actionLabel: 'Open',
      actionPath: '/procurements',
    },
  ];

  return (
    <div 
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-6"
      onClick={() => setOpenActionMenuId(null)}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 01. Compact Hero Header (Reduced height, enterprise SaaS feel) */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('goodMorning')}, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            From procurement requirements to compliant specifications.
          </p>

          <div className="flex items-center gap-2.5 mt-4">
            <button
              onClick={() => navigate('/procurements/new')}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('newAnalysis')}</span>
            </button>
            <button
              onClick={() => navigate('/standards')}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300/90 text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('exploreStandards')}</span>
            </button>
          </div>
        </div>

        {/* Subtle Parliament Silhouette on right (significantly reduced dominance) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block overflow-hidden pointer-events-none select-none opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10 w-24" />
          <img
            src="/parliament.png"
            alt="Indian Parliament"
            className="w-full h-full object-cover object-center grayscale contrast-125"
          />
        </div>
      </div>

      {/* 02. Functional KPI Row (Overview at a glance) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Analyses */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Analyses</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">03</span>
            <span className="text-[11px] text-emerald-600 font-semibold">+2 this week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across 4 procurement branches</p>
        </div>

        {/* KPI 2: Documents In Review */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Documents In Review</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">01</span>
            <span className="text-[11px] text-amber-600 font-medium">Pending verification</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ordinary Portland Cement 43</p>
        </div>

        {/* KPI 3: Compliance Issues */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Compliance Issues</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">07</span>
            <span className="text-[11px] text-rose-600 font-medium">Attention needed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">5 minor, 2 statutory QCO</p>
        </div>

        {/* KPI 4: Active Alerts */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Alerts</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">12</span>
            <span className="text-[11px] text-indigo-600 font-medium">BIS Gazette Live</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">3 mandatory amendments</p>
        </div>
      </div>

      {/* 03. Needs Attention Section (Answers "What needs my attention right now?") */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">Needs Attention</h2>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              4 Actionable
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Priority triage for procurement compliance</span>
        </div>

        <div className="divide-y divide-slate-100">
          {attentionItems.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.severity === 'urgent' ? 'bg-rose-500' :
                  item.severity === 'warning' ? 'bg-amber-500' :
                  item.severity === 'info' ? 'bg-blue-500' : 'bg-slate-400'
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (item.docId) {
                    setActiveDocId(item.docId);
                    navigate(item.actionPath, { state: { selectedDocId: item.docId } });
                  } else {
                    navigate(item.actionPath);
                  }
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 04. Recent Documents & Verification Reports */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Section Header & Interactive Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Documents
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                ({documents.length} analyzed)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Technical specifications, normative Indian Standards, and mandatory QCO compliance.
            </p>
          </div>

          {/* Right Toolbar: Search, Filters, View Switcher & View All */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Filter Tabs */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({documents.length})
              </button>
              <button
                onClick={() => setStatusFilter('Completed')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'Completed'
                    ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('In Review')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'In Review'
                    ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                In Review
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter title or IS..."
                className="pl-8 pr-3 py-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-36 sm:w-44"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View All Link */}
            <Link
              to="/procurements"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <span>{t('viewAll')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Content Body */}
        {filteredDocs.length === 0 ? (
          <div className="py-14 px-6 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 text-sm">
              {searchQuery ? 'No matching procurements found' : 'No analyzed documents yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No documents matched "${searchQuery}". Try clearing filters.`
                : 'Upload a procurement tender or enter a specification in Review to start analyzing Indian Standards.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            ) : (
              <Link
                to="/review"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Analyze First Document</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* 01. STREAMLINED, GORGEOUS ENTERPRISE DATA TABLE */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Document</th>
                  <th className="py-3 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3 px-4">Compliance</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Standards</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const docBasket = getDocumentBasket(doc.id);
                  const score = doc.auditSummary?.complianceScore ?? 0;
                  const isHigh = score >= 90;

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => handleOpenDoc(doc)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Document Title (Strongest Element) & Smaller Metadata */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 max-w-md">
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm leading-snug line-clamp-1 transition-colors">
                              {doc.title}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                              <span className="truncate max-w-[200px]">{doc.fileName}</span>
                              <span>•</span>
                              <span>{doc.totalPages || 1} pgs</span>
                              <span>•</span>
                              <span>{doc.uploadedAt}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                        <span className="text-xs text-slate-600 font-medium">
                          {doc.category || 'General Procurement'}
                        </span>
                      </td>

                      {/* Compliance Visualization */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono font-bold text-xs ${isHigh ? 'text-emerald-700' : 'text-blue-700'}`}>
                              {score}%
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">Compliance</span>
                          </div>
                          <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isHigh ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          {!isHigh && (
                            <p className="text-[10px] text-amber-600 font-medium">2 requirements need review</p>
                          )}
                        </div>
                      </td>

                      {/* Simplified Standards Badges: IS 12615 · QCO */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {docBasket.length > 0 ? (
                            docBasket.slice(0, 2).map((std) => (
                              <span
                                key={std.id}
                                className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded transition-colors"
                              >
                                <span className="font-semibold text-slate-800">{std.code.split(':')[0]}</span>
                                {std.mandatory && (
                                  <span className="text-slate-400 font-sans ml-1 text-[11px]">· QCO</span>
                                )}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">No standards linked</span>
                          )}
                          {docBasket.length > 2 && (
                            <span className="text-xs text-slate-400 font-medium">
                              +{docBasket.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Compact Subtle Status Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                            doc.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : doc.status === 'In Review'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-slate-50 text-slate-600 border-slate-200/60'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          <span>{doc.status}</span>
                        </span>
                      </td>

                      {/* Actions: "View Report" + Overflow Menu */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDocForOutput(doc)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            title="View comprehensive verification report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Report</span>
                          </button>

                          {/* Secondary Overflow Actions */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === doc.id ? null : doc.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="More options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {openActionMenuId === doc.id && (
                              <div
                                className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-xs text-left"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    handleQuickCopy(doc, e);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy Specification</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    handleQuickPdf(doc, e);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Download PDF</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleOpenDoc(doc);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Open in Review</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* 02. EXECUTIVE CARD GRID VIEW */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/50">
            {filteredDocs.map((doc) => {
              const docBasket = getDocumentBasket(doc.id);
              const score = doc.auditSummary?.complianceScore ?? 0;
              const isHigh = score >= 90;

              return (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDoc(doc)}
                  className="min-w-0 bg-white border border-slate-200/90 hover:border-blue-400 rounded-xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Card Top: Category & Status Pill */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[170px]">
                        {doc.category || 'General Procurement'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
                          doc.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            : doc.status === 'In Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                            : 'bg-slate-50 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        <span>{doc.status}</span>
                      </span>
                    </div>

                    {/* Document Title */}
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm leading-snug line-clamp-2 mt-2.5 mb-1.5 transition-colors">
                      {doc.title}
                    </h3>

                    {/* Subtitle */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="truncate max-w-[180px]">{doc.fileName}</span>
                      <span>•</span>
                      <span>{doc.totalPages || 1} pgs</span>
                    </div>

                    {/* Simplified Standards Badges Strip */}
                    <div className="mt-4 space-y-1.5">
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Matched BIS Standards</span>
                        <span className="font-semibold text-blue-600">{docBasket.length} Linked</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {docBasket.length > 0 ? (
                          docBasket.slice(0, 2).map((std) => (
                            <span
                              key={std.id}
                              className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded transition-colors"
                            >
                              <span className="font-semibold text-slate-800">{std.code.split(':')[0]}</span>
                              {std.mandatory && (
                                <span className="text-slate-400 font-sans ml-1 text-[11px]">· QCO</span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No standards linked</span>
                        )}
                        {docBasket.length > 2 && (
                          <span className="text-xs text-slate-400 font-medium">
                            +{docBasket.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Compliance Score & Quick Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
                          <ShieldCheck className={`w-3.5 h-3.5 ${isHigh ? 'text-emerald-500' : 'text-blue-500'}`} />
                          <span>Compliance Score</span>
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-800">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            isHigh ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {!isHigh && (
                        <p className="text-[10px] text-amber-600 font-medium mt-1">2 requirements need review</p>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleQuickCopy(doc, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Copy tender specification"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleQuickPdf(doc, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Download official PDF report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedDocForOutput(doc)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  <span className="text-slate-400 text-xs font-mono">• {selectedDocForOutput.fileName}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {selectedDocForOutput.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocForOutput(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Compliance Stats */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Overall Score</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  {selectedDocForOutput.auditSummary?.complianceScore ?? 0}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Standards Mapped</span>
                <span className="text-base font-bold font-mono text-blue-600">
                  {getDocumentBasket(selectedDocForOutput.id).length} IS Codes
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Statutory Status</span>
                <span className="text-base font-bold text-slate-800">
                  {selectedDocForOutput.status}
                </span>
              </div>
            </div>

            {/* Extracted Specification Text Block */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Tender Specification Grounding:</span>
              <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto max-h-56 leading-relaxed select-all">
                {selectedDocForOutput.rawTextContent || 
                  selectedDocForOutput.requirements.map(r => `• ${r.title}: ${r.requirementText}`).join('\n\n') || 
                  'No extracted specification snippet available.'}
              </div>
            </div>

            {/* Modal Bottom Actions */}
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
