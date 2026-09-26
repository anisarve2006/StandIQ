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

const INITIAL_PROCUREMENTS: ProcurementItem[] = [
  {
    id: 'pr-1',
    title: 'Electrical Distribution Panel',
    category: 'Electrical Equipment',
    status: 'In Review',
    standardsCount: 7,
    updated: '24 Sep 2026'
  },
  {
    id: 'pr-2',
    title: 'Cement Supply',
    category: 'Construction Materials',
    status: 'Ready',
    standardsCount: 8,
    updated: '22 Sep 2026'
  },
  {
    id: 'pr-3',
    title: 'Solar PV Modules',
    category: 'Renewable Energy',
    status: 'Completed',
    standardsCount: 6,
    updated: '20 Sep 2026'
  },
  {
    id: 'pr-4',
    title: 'Fire Safety Equipment',
    category: 'Safety Equipment',
    status: 'Draft',
    standardsCount: 4,
    updated: '18 Sep 2026'
  },
  {
    id: 'pr-5',
    title: 'Water Pumps',
    category: 'Industrial Equipment',
    status: 'In Review',
    standardsCount: 6,
    updated: '16 Sep 2026'
  },
  {
    id: 'pr-6',
    title: 'IT Laptops',
    category: 'IT Equipment',
    status: 'Ready',
    standardsCount: 5,
    updated: '15 Sep 2026'
  },
  {
    id: 'pr-7',
    title: 'Road Construction Material',
    category: 'Construction Materials',
    status: 'Draft',
    standardsCount: 3,
    updated: '12 Sep 2026'
  },
  {
    id: 'pr-8',
    title: 'Medical Equipment',
    category: 'Medical Devices',
    status: 'Completed',
    standardsCount: 9,
    updated: '10 Sep 2026'
  }
];

export default function ProcurementsPage() {
  const navigate = useNavigate();
  const { setCurrentProcurement } = useProcurement();
  const { formatDate } = useStandIQ();

  const [procurements, setProcurements] = useState<ProcurementItem[]>(INITIAL_PROCUREMENTS);
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
    setCurrentProcurement({ id: p.id, name: p.title, category: p.category });
    navigate('/tender-health');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ProcurementItem = {
      id: `pr-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: 'Draft',
      standardsCount: 0,
      updated: 'Just now'
    };

    setProcurements([newItem, ...procurements]);
    setIsCreateOpen(false);
    setNewTitle('');
    handleOpenProcurement(newItem);
  };

  const filteredProcurements = procurements.filter(p => {
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
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Standards</th>
                <th className="py-3 px-6">Updated</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcurements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No procurements match your current search or filters.
                  </td>
                </tr>
              ) : (
                filteredProcurements.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleOpenProcurement(p)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-6 font-semibold text-slate-900 group-hover:text-blue-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
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
                    <td className="py-3.5 px-6 text-center">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                        {p.standardsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {formatDate(p.updated)}
                    </td>
                    <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenProcurement(p)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
