import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Share2, 
  ExternalLink, 
  BookOpen, 
  Flame, 
  Box, 
  FlaskConical, 
  ShieldCheck, 
  Building2, 
  RotateCcw, 
  List, 
  LayoutGrid, 
  Plus, 
  Zap, 
  Check 
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

export interface StandardItem {
  id: string;
  code: string;
  title: string;
  status: 'Current' | 'Superseded' | 'Withdrawn';
  type: 'Product' | 'Testing' | 'Safety' | 'Terminology' | 'Code of Practice';
  industry: 'Electrical' | 'Mechanical' | 'Construction' | 'Metallurgy' | 'IT & Electronics' | 'Chemical';
  division?: string;
  tags: string[];
  reaffirmed: number;
  relatedCount: number;
  year: number;
  iconBg?: string;
  iconColor?: string;
}

export function getStandardTagColor(tag: string): string {
  if (tag.includes('Product') || tag.includes('Code')) return 'bg-blue-50 text-blue-700 border-blue-200/60';
  if (tag.includes('Energy') || tag.includes('Latest') || tag.includes('Testing')) return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  if (tag.includes('QCO') || tag.includes('Mandatory')) return 'bg-rose-50 text-rose-700 border-rose-200/60';
  if (tag.includes('General') || tag.includes('Civil')) return 'bg-amber-50 text-amber-700 border-amber-200/60';
  return 'bg-purple-50 text-purple-700 border-purple-200/60';
}

export const ALL_STANDARDS: StandardItem[] = [
  {
    id: 'is-12615-2018',
    code: 'IS 12615:2018',
    title: 'Energy Efficient Induction Motors (Three-phase)',
    status: 'Current',
    type: 'Product',
    industry: 'Electrical',
    division: 'Electrotechnical',
    tags: ['Product Standard', 'Energy Efficiency', 'Testing Requirements'],
    reaffirmed: 2023,
    relatedCount: 7,
    year: 2018,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500'
  },
  {
    id: 'is-325-1996',
    code: 'IS 325:1996',
    title: 'Three-phase Induction Motors',
    status: 'Current',
    type: 'Product',
    industry: 'Electrical',
    division: 'Electrotechnical',
    tags: ['Product Standard', 'General Requirements', 'Dimensions'],
    reaffirmed: 2019,
    relatedCount: 5,
    year: 1996,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500'
  },
  {
    id: 'is-456-2000',
    code: 'IS 456:2000',
    title: 'Plain and Reinforced Concrete — Code of Practice',
    status: 'Current',
    type: 'Code of Practice',
    industry: 'Construction',
    division: 'Civil Engineering',
    tags: ['Code of Practice', 'Civil Engineering', 'Construction'],
    reaffirmed: 2021,
    relatedCount: 12,
    year: 2000,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500'
  },
  {
    id: 'is-1786-2023',
    code: 'IS 1786:2023',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification',
    status: 'Current',
    type: 'Product',
    industry: 'Metallurgy',
    division: 'Civil & Metallurgical',
    tags: ['Product Standard', 'TMT Rebars', 'Mandatory QCO'],
    reaffirmed: 2023,
    relatedCount: 9,
    year: 2023,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500'
  },
  {
    id: 'is-3025-2021',
    code: 'IS 3025 (Part 39):2021',
    title: 'Methods of Sampling and Test (Water and Waste Water) — Part 39: pH Value',
    status: 'Current',
    type: 'Testing',
    industry: 'Chemical',
    division: 'Chemical Engineering',
    tags: ['Testing Method', 'Water Quality'],
    reaffirmed: 2021,
    relatedCount: 4,
    year: 2021,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500'
  }
];

export default function StandardsDiscoveryPage() {
  const navigate = useNavigate();
  const { addToBasket, basket } = useStandIQ();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Standards');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Electrical']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Current']);
  const [sinceYear, setSinceYear] = useState<number>(1980);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'Relevance' | 'Newest' | 'Code'>('Relevance');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Tab Definitions matching Image 4
  const tabs = [
    { label: 'All Standards', count: '12,416', icon: Flame },
    { label: 'Product Standards', count: '6,322', icon: Box },
    { label: 'Testing Methods', count: '4,216', icon: FlaskConical },
    { label: 'Safety Standards', count: '3,110', icon: ShieldCheck },
    { label: 'Codes of Practice', count: '2,801', icon: Building2 },
    { label: 'Terminology', count: '1,954', icon: BookOpen },
  ];

  // Industry filters with counts
  const industryFilters = [
    { name: 'Electrical', count: '1,234' },
    { name: 'Mechanical', count: '856' },
    { name: 'Construction', count: '1,146' },
    { name: 'Metallurgy', count: '614' },
    { name: 'IT & Electronics', count: '876' },
    { name: 'Chemical', count: '558' },
  ];

  const handleToggleIndustry = (name: string) => {
    setSelectedIndustries(prev => 
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handleToggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(x => x !== status) : [...prev, status]
    );
  };

  const handleResetFilters = () => {
    setSelectedIndustries(['Electrical']);
    setSelectedStatuses(['Current']);
    setSinceYear(1980);
    setSearchQuery('');
  };

  const handleAddToBasket = (std: StandardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToBasket({
      id: std.code,
      code: std.code,
      title: std.title,
      type: std.type,
      status: std.status,
      year: std.year,
      reaffirmedYear: std.reaffirmed,
      relatedCount: std.relatedCount,
      tags: std.tags
    });
    setAddedIds(prev => [...prev, std.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(x => x !== std.id));
    }, 2000);
  };

  // Filtered standards
  const filteredStandards = useMemo(() => {
    return ALL_STANDARDS.filter((std) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = std.code.toLowerCase().includes(q);
        const matchTitle = std.title.toLowerCase().includes(q);
        if (!matchCode && !matchTitle) return false;
      }
      if (selectedIndustries.length > 0 && !selectedIndustries.includes(std.industry)) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(std.status)) {
        return false;
      }
      if (std.year < sinceYear) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustries, selectedStatuses, sinceYear]);

  return (
    <div className="min-h-full bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Indian Standards Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Search and explore official BIS standards with interactive filters.
            </p>
          </div>
        </div>

        {/* Active Tender Basket Badge */}
        <div 
          onClick={() => navigate('/basket')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 border border-orange-200/80 text-xs font-semibold text-orange-800 shadow-2xs hover:bg-orange-100/70 transition-colors cursor-pointer shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Active Tender Basket: TENDER SPECIFICATION: TENDER16</span>
          <ChevronRight className="w-3.5 h-3.5 text-orange-600" />
        </div>
      </div>

      {/* 2. Main Search Bar */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by standard number (e.g. IS 12615), title, keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>
        <button
          onClick={() => {}}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>

      {/* 3. Standard Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[11px] font-normal ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Filter Sidebar & Standards List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Filter Column (Span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Filters</h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-slate-400 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Reset all</span>
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Industry Filter Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Industry</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2">
              {industryFilters.map((ind) => {
                const isChecked = selectedIndustries.includes(ind.name);
                return (
                  <label
                    key={ind.name}
                    className="flex items-center justify-between text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleIndustry(ind.name)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                      <span>{ind.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">({ind.count})</span>
                  </label>
                );
              })}

              <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 pt-1 cursor-pointer">
                + Show more
              </button>
            </div>
          </div>

          {/* Status Filter Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Status</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2">
              {[
                { name: 'Current', count: '18,421' },
                { name: 'Superseded', count: '1,254' },
                { name: 'Withdrawn', count: '456' }
              ].map((st) => {
                const isChecked = selectedStatuses.includes(st.name);
                return (
                  <label
                    key={st.name}
                    className="flex items-center justify-between text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStatus(st.name)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                      <span>{st.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">({st.count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Since Year Slider */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Since Year</span>
              <span className="font-mono text-slate-500 font-semibold">{sinceYear}</span>
            </div>

            <input
              type="range"
              min="1980"
              max="2026"
              value={sinceYear}
              onChange={(e) => setSinceYear(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>1980</span>
              <span>2026</span>
            </div>
          </div>
        </div>

        {/* Right Standards Results (Span 9) */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Results Control Bar */}
          <div className="flex items-center justify-between pb-1">
            <p className="text-xs text-slate-500">
              Showing <strong className="text-slate-900 font-bold">{filteredStandards.length}</strong> matching standards
            </p>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option>Relevance</option>
                  <option>Newest</option>
                  <option>Code</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredStandards.map((std) => {
              const isAdded = addedIds.includes(std.id) || basket.some(b => b.code === std.code);

              return (
                <div
                  key={std.id}
                  onClick={() => navigate(`/standards/${encodeURIComponent(std.code)}`)}
                  className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs hover:border-orange-300 hover:shadow-xs p-5 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    
                    {/* Left Icon & Information */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-2xl ${std.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                        <Zap className={`w-6 h-6 ${std.iconColor}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Standard Code, Status Badge, Year */}
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                            <span>{std.code}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </h3>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {std.status}
                          </span>

                          <span className="text-xs text-slate-400 font-medium">
                            Year: {std.year}
                          </span>
                        </div>

                        {/* Standard Full Title */}
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
                          {std.title}
                        </p>

                        {/* Category Tags */}
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          {std.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${getStandardTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Meta Footnotes */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span>Reaffirmed:</span>
                            <strong className="text-slate-800">{std.reaffirmed}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>Related:</span>
                            <strong className="text-slate-800">{std.relatedCount}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>Industry:</span>
                            <strong className="text-slate-800">{std.industry}</strong>
                          </span>
                          <span className="ml-auto text-[11px] text-slate-400 font-medium hidden sm:inline">
                            BIS Division: {std.division}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={(e) => handleAddToBasket(std, e)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                          isAdded
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Basket</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Basket</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/graph');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors py-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>View Graph</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
