import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  ChevronDown, 
  X,
  Briefcase,
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Building2,
  Box,
  FlaskConical,
  Layers,
  BookOpen
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface ProcurementRow {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  status: 'In Review' | 'Completed' | 'Active' | 'Draft';
  statusColor: string;
  statusDot: string;
  standardsCount: number;
  updated: string;
  rowIcon: React.ComponentType<{ className?: string }>;
  rowIconBg: string;
  rowIconColor: string;
}

export default function ProcurementsPage() {
  const navigate = useNavigate();
  const { setActiveDocId } = useStandIQ();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Drafts' | 'In Review' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusDropdown, setStatusDropdown] = useState('All Status');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electrical Equipment');

  // Exact 6 items from Image 2
  const procurementRows: ProcurementRow[] = [
    {
      id: 'doc-tender16',
      title: 'TENDER SPECIFICATION: TENDER16',
      subtitle: 'Detailed technical specification for civil works',
      category: 'Uploaded Tender',
      categoryIcon: Building2,
      status: 'In Review',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
      statusDot: 'bg-amber-500',
      standardsCount: 0,
      updated: '24 Sep 2026',
      rowIcon: FileText,
      rowIconBg: 'bg-blue-50',
      rowIconColor: 'text-blue-500'
    },
    {
      id: 'doc-motor-15kw',
      title: '15 kW Energy Efficient 3-Phase Induction Moto...',
      subtitle: 'Energy efficient motors as per IS 12615:2018',
      category: 'Electrical Equipment',
      categoryIcon: Zap,
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      statusDot: 'bg-emerald-500',
      standardsCount: 1,
      updated: '24 Sep 2026',
      rowIcon: Zap,
      rowIconBg: 'bg-emerald-50',
      rowIconColor: 'text-emerald-500'
    },
    {
      id: 'doc-cement-43',
      title: 'Ordinary Portland Cement 43 Grade - Housing ...',
      subtitle: 'Cement requirements for housing infrastructure',
      category: 'Construction Materials',
      categoryIcon: Box,
      status: 'In Review',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
      statusDot: 'bg-amber-500',
      standardsCount: 1,
      updated: '24 Sep 2026',
      rowIcon: Layers,
      rowIconBg: 'bg-amber-50',
      rowIconColor: 'text-amber-500'
    },
    {
      id: 'doc-tmt-500d',
      title: 'Fe 500D TMT Steel Rebars - Highway Overpass...',
      subtitle: 'High strength steel rebars for infrastructure',
      category: 'Construction Materials',
      categoryIcon: Box,
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      statusDot: 'bg-emerald-500',
      standardsCount: 2,
      updated: '24 Sep 2026',
      rowIcon: Building2,
      rowIconBg: 'bg-purple-50',
      rowIconColor: 'text-purple-500'
    },
    {
      id: 'doc-water-sampling',
      title: 'Water Sampling and Test (pH Value)',
      subtitle: 'Methods of sampling and test as per IS 3025 (Part 39)',
      category: 'Environment',
      categoryIcon: FlaskConical,
      status: 'Active',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
      statusDot: 'bg-blue-500',
      standardsCount: 3,
      updated: '22 Sep 2026',
      rowIcon: FlaskConical,
      rowIconBg: 'bg-rose-50',
      rowIconColor: 'text-rose-500'
    },
    {
      id: 'doc-switchgear-415v',
      title: '415V Low Voltage Switchgear Specification',
      subtitle: 'Technical clause review for switchgear and panels',
      category: 'Electrical Equipment',
      categoryIcon: Zap,
      status: 'Draft',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200/60',
      statusDot: 'bg-slate-400',
      standardsCount: 0,
      updated: '20 Sep 2026',
      rowIcon: Box,
      rowIconBg: 'bg-purple-50',
      rowIconColor: 'text-purple-500'
    }
  ];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(procurementRows.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOpenRow = (id: string) => {
    setActiveDocId(id);
    navigate('/review', { state: { selectedDocId: id } });
  };

  // Filtered rows
  const filteredRows = procurementRows.filter((row) => {
    if (activeFilter === 'Active' && row.status !== 'Active') return false;
    if (activeFilter === 'Drafts' && row.status !== 'Draft') return false;
    if (activeFilter === 'In Review' && row.status !== 'In Review') return false;
    if (activeFilter === 'Completed' && row.status !== 'Completed') return false;
    if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
    if (statusDropdown !== 'All Status' && row.status !== statusDropdown) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        row.title.toLowerCase().includes(q) ||
        row.subtitle.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-full bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-2xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Procurements
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage and track tender specifications and applicable standards.
            </p>
          </div>
        </div>

        {/* Create Procurement Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Procurement</span>
        </button>
      </div>

      {/* 2. Status Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {/* All 122 */}
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'All'
              ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-orange-500" />
          <span>All</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500 text-white font-bold ml-0.5">
            122
          </span>
        </button>

        {/* Active 6 */}
        <button
          onClick={() => setActiveFilter('Active')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active</span>
          <span className="text-[11px] text-slate-400 font-normal">6</span>
        </button>

        {/* Drafts 4 */}
        <button
          onClick={() => setActiveFilter('Drafts')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'Drafts'
              ? 'bg-slate-100 text-slate-800 border border-slate-300 font-semibold'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Drafts</span>
          <span className="text-[11px] text-slate-400 font-normal">4</span>
        </button>

        {/* In Review 5 */}
        <button
          onClick={() => setActiveFilter('In Review')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'In Review'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>In Review</span>
          <span className="text-[11px] text-slate-400 font-normal">5</span>
        </button>

        {/* Completed 18 */}
        <button
          onClick={() => setActiveFilter('Completed')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Completed</span>
          <span className="text-[11px] text-slate-400 font-normal">18</span>
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procurements by title, category, standard..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden cursor-pointer"
            >
              <option>All Categories</option>
              <option>Uploaded Tender</option>
              <option>Electrical Equipment</option>
              <option>Construction Materials</option>
              <option>Environment</option>
            </select>
            <LayoutGrid className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusDropdown}
              onChange={(e) => setStatusDropdown(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>In Review</option>
              <option>Completed</option>
              <option>Draft</option>
            </select>
            <CheckCircle2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Last Updated Sort */}
          <div className="relative">
            <button className="flex items-center gap-2 pl-3 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Updated</span>
              <ChevronDown className="absolute right-2.5 top-3 w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Procurements Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fbfcfd] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === procurementRows.length && procurementRows.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">TITLE</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">STANDARDS</th>
                <th className="py-3.5 px-4">UPDATED</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => {
                const CategoryIcon = row.categoryIcon;
                const RowIcon = row.rowIcon;
                const isSelected = selectedIds.includes(row.id);

                return (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenRow(row.id)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4 w-10" onClick={(e) => handleToggleRow(row.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                    </td>

                    {/* Title with Colored Icon */}
                    <td className="py-4 px-4 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${row.rowIconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          <RowIcon className={`w-4 h-4 ${row.rowIconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs md:text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                            {row.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{row.category}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${row.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.statusDot}`} />
                        <span>{row.status}</span>
                      </span>
                    </td>

                    {/* Standards Count */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{row.standardsCount}</span>
                      </div>
                    </td>

                    {/* Updated Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{row.updated}</span>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create Procurement Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">New Procurement Tender</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tender Title / Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Supply of TMT Steel Rebars for NH-44 Extension"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Engineering Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option>Construction Materials</option>
                <option>Electrical Equipment</option>
                <option>Environment & Water</option>
                <option>Mechanical & Metallurgy</option>
                <option>IT & Electronics</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  navigate('/review');
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Create & Upload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
