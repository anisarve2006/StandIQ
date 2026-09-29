import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  ChevronDown,
  X
} from 'lucide-react';
import { useProcurement } from '../../stores/procurement.store';
import { useStandIQ } from '../../stores/standiq.store';

interface ProcurementItem {
  id: string;
  title: string;
  category: string;
  status: 'In Review' | 'Ready' | 'Completed' | 'Draft';
  standardsCount: number;
  updated: string;
}

export default function ProcurementsPage() {
  const navigate = useNavigate();
  const { setCurrentProcurement } = useProcurement();
  const { formatDate, documents, setActiveDocId, getDocumentBasket, addOrUpdateDocument } = useStandIQ();

  // Map persistent documents to procurement items
  const mappedStoreItems: ProcurementItem[] = documents.map(d => ({
    id: d.id,
    title: d.title,
    category: d.category || 'Electrical Equipment',
    status: d.status,
    standardsCount: getDocumentBasket(d.id).length,
    updated: d.uploadedAt
  }));

  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Drafts' | 'In Review' | 'Completed'>('All');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electrical Equipment');

  const categories = [
    'All Categories',
    'Electrical Equipment',
    'Construction Materials',
    'Renewable Energy',
    'Safety Equipment',
    'Industrial Equipment',
    'IT Equipment',
    'Medical Devices'
  ];

  const statuses = [
    'All Status',
    'In Review',
    'Ready',
    'Completed',
    'Draft'
  ];

  const handleOpenProcurement = (p: ProcurementItem) => {
    setActiveDocId(p.id);
    setCurrentProcurement({ id: p.id, name: p.title, category: p.category });
    navigate('/review', { state: { selectedDocId: p.id } });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newId = `pr-${Date.now()}`;
    addOrUpdateDocument({
      id: newId,
      title: newTitle,
      category: newCategory,
      status: 'Draft',
      uploadedAt: 'Today',
      fileType: 'pdf',
      basket: []
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setActiveDocId(newId);
    navigate('/review', { state: { selectedDocId: newId } });
  };

  const filteredProcurements = mappedStoreItems.filter(p => {
    // Tab filter
    if (activeTab === 'Active' && p.status !== 'Ready') return false;
    if (activeTab === 'Drafts' && p.status !== 'Draft') return false;
    if (activeTab === 'In Review' && p.status !== 'In Review') return false;
    if (activeTab === 'Completed' && p.status !== 'Completed') return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) return false;

    // Status
    if (selectedStatus !== 'All Status' && p.status !== selectedStatus) return false;

    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Procurements</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and track tender specifications and applicable standards</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Procurement</span>
        </button>
      </div>

      {/* 02. Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        {[
          { key: 'All', label: 'All', count: 12 },
          { key: 'Active', label: 'Active', count: 6 },
          { key: 'Drafts', label: 'Drafts', count: 4 },
          { key: 'In Review', label: 'In Review', count: 5 },
          { key: 'Completed', label: 'Completed', count: 18 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 pt-1 px-3 border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* 03. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search procurements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 04. Procurements Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[300px]">Title</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[160px]">Category</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[120px]">Status</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap min-w-[110px]">Standards</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[120px]">Updated</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcurements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {documents.length === 0 ? 'No procurements created yet' : 'No matching procurements'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {documents.length === 0 
                          ? 'Upload a tender in Review & Verify or click New Procurement to start.' 
                          : 'Try adjusting your search query or category filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProcurements.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleOpenProcurement(p)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 group-hover:text-blue-600 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50/80 text-blue-600 shrink-0 group-hover:bg-blue-100/80 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[280px] font-semibold text-slate-900 group-hover:text-blue-600 leading-snug">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap min-w-[160px]">
                      {p.category}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap min-w-[120px]">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
                          p.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'In Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : p.status === 'Ready'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap min-w-[110px]">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 whitespace-nowrap">
                        {p.standardsCount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap min-w-[120px]">
                      {formatDate(p.updated)}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap min-w-[90px]" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenProcurement(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                        title="Open Procurement Analysis"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Procurement Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Create New Procurement</h2>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Procurement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Energy Efficient Induction Motors 75kW"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {categories.filter(c => c !== 'All Categories').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs"
                >
                  Create & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
