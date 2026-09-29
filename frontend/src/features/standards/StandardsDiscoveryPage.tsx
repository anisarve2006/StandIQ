import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  Check, 
  Plus, 
  Share2,
  ExternalLink
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

export interface StandardItem {
  id: string;
  code: string;
  title: string;
  status: 'Current' | 'Superseded' | 'Withdrawn';
  type: 'Product' | 'Testing' | 'Safety' | 'Terminology' | 'Code of Practice';
  industry: 'Electrical' | 'Mechanical' | 'Construction' | 'Metallurgy' | 'IT & Electronics' | 'Chemical' | 'Aerospace' | 'Textile';
  tags: string[];
  reaffirmed: number;
  relatedCount: number;
  year: number;
}

export const ALL_STANDARDS: StandardItem[] = [
  {
    id: 'is-12615-2018',
    code: 'IS 12615:2018',
    title: 'Energy Efficient Induction Motors (Three-phase)',
    status: 'Current',
    type: 'Product',
    industry: 'Electrical',
    tags: ['Product Standard', 'Energy Efficiency', 'Testing Requirements'],
    reaffirmed: 2023,
    relatedCount: 7,
    year: 2018
  },
  {
    id: 'is-325-1996',
    code: 'IS 325:1996',
    title: 'Three-phase Induction Motors',
    status: 'Current',
    type: 'Product',
    industry: 'Electrical',
    tags: ['Product Standard', 'General Requirements', 'Dimensions'],
    reaffirmed: 2019,
    relatedCount: 5,
    year: 1996
  },
  {
    id: 'is-802-1995',
    code: 'IS 802:1995',
    title: 'Code of Practice for Use of Cold-Formed Light Gauge Steel Structural Members',
    status: 'Current',
    type: 'Code of Practice',
    industry: 'Construction',
    tags: ['Code of Practice', 'Construction'],
    reaffirmed: 2020,
    relatedCount: 12,
    year: 1995
  },
  {
    id: 'is-8789-1981',
    code: 'IS 8789:1981',
    title: 'Method of Test for Efficiency of Induction Motors',
    status: 'Current',
    type: 'Testing',
    industry: 'Electrical',
    tags: ['Testing Standard', 'Efficiency Test', 'Measurements'],
    reaffirmed: 2021,
    relatedCount: 4,
    year: 1981
  },
  {
    id: 'is-302-2008',
    code: 'IS 302:2008',
    title: 'Safety of Household and Similar Electrical Equipment',
    status: 'Current',
    type: 'Safety',
    industry: 'Electrical',
    tags: ['Safety Standard', 'General Safety', 'Protection'],
    reaffirmed: 2022,
    relatedCount: 8,
    year: 2008
  },
  {
    id: 'is-9383-1997',
    code: 'IS 9383:1997',
    title: 'Installation of Electrical Equipment in Hazardous Areas',
    status: 'Current',
    type: 'Product',
    industry: 'Electrical',
    tags: ['Installation Standard', 'Hazardous Areas'],
    reaffirmed: 2020,
    relatedCount: 3,
    year: 1997
  },
  {
    id: 'is-17428-2023',
    code: 'IS 17428:2023',
    title: 'Battery Management System for Electric Mobility Applications',
    status: 'Current',
    type: 'Safety',
    industry: 'IT & Electronics',
    tags: ['Electric Vehicles', 'BMS', 'Safety Architecture'],
    reaffirmed: 2023,
    relatedCount: 6,
    year: 2023
  },
  {
    id: 'is-456-2000',
    code: 'IS 456:2000',
    title: 'Plain and Reinforced Concrete - Code of Practice',
    status: 'Current',
    type: 'Code of Practice',
    industry: 'Construction',
    tags: ['Structural', 'Concrete', 'Civil Engineering'],
    reaffirmed: 2021,
    relatedCount: 16,
    year: 2000
  },
  {
    id: 'is-2062-2011',
    code: 'IS 2062:2011',
    title: 'Hot Rolled Medium and High Tensile Structural Steel',
    status: 'Current',
    type: 'Product',
    industry: 'Metallurgy',
    tags: ['Structural Steel', 'Tensile Strength', 'Fabrication'],
    reaffirmed: 2020,
    relatedCount: 9,
    year: 2011
  },
  {
    id: 'is-1528-2019',
    code: 'IS 1528:2019',
    title: 'Methods of Sampling and Physical Tests for Refractory Materials',
    status: 'Current',
    type: 'Testing',
    industry: 'Chemical',
    tags: ['Refractory', 'Physical Testing', 'Sampling'],
    reaffirmed: 2024,
    relatedCount: 5,
    year: 2019
  }
];

export default function StandardsDiscoveryPage() {
  const navigate = useNavigate();
  const { addToBasket, removeFromBasket, isInBasket, activeDocument } = useStandIQ();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<'All' | 'Product' | 'Testing' | 'Safety' | 'Terminology' | 'Code of Practice'>('All');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Current']);
  const [minYear, setMinYear] = useState<number>(1980);
  const [showAllIndustries, setShowAllIndustries] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState('Relevance');

  const allIndustries = [
    { label: 'Electrical', count: '1,234' },
    { label: 'Mechanical', count: '856' },
    { label: 'Construction', count: '1,146' },
    { label: 'Metallurgy', count: '614' },
    { label: 'IT & Electronics', count: '876' },
    { label: 'Chemical', count: '558' },
    { label: 'Aerospace', count: '210' },
    { label: 'Textile', count: '342' }
  ];

  const visibleIndustries = showAllIndustries ? allIndustries : allIndustries.slice(0, 6);

  const statuses = [
    { label: 'Current', count: '18,421' },
    { label: 'Superseded', count: '1,254' },
    { label: 'Withdrawn', count: '456' }
  ];

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries(prev => 
      prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind]
    );
  };

  const toggleStatus = (st: string) => {
    setSelectedStatuses(prev => 
      prev.includes(st) ? prev.filter(x => x !== st) : [...prev, st]
    );
  };

  const handleBasketToggle = (std: StandardItem) => {
    if (isInBasket(std.code)) {
      removeFromBasket(std.code);
    } else {
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
    }
  };

  const filteredStandards = useMemo(() => {
    const list = ALL_STANDARDS.filter(s => {
      if (activeTypeTab !== 'All' && s.type !== activeTypeTab) return false;
      if (selectedIndustries.length > 0 && !selectedIndustries.includes(s.industry)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(s.status)) return false;
      if (s.year < minYear) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = s.code.toLowerCase().includes(q) || 
                      s.title.toLowerCase().includes(q) || 
                      s.industry.toLowerCase().includes(q) || 
                      s.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });

    if (sortBy === 'Latest') {
      return [...list].sort((a, b) => b.year - a.year);
    }
    if (sortBy === 'Popular') {
      return [...list].sort((a, b) => b.relatedCount - a.relatedCount);
    }
    return list;
  }, [activeTypeTab, selectedIndustries, selectedStatuses, minYear, searchQuery, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Indian Standards Explorer</h1>
          <p className="text-xs text-slate-500 mt-0.5">Search and explore official BIS standards with interactive facet filters.</p>
        </div>
        {activeDocument && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-600/20 text-xs text-amber-900 font-medium whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <span>Active Tender Basket: <strong className="font-semibold">{activeDocument.title || activeDocument.fileName}</strong></span>
          </div>
        )}
      </div>

      {/* 02. Prominent Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by standard number (e.g. IS 12615), title, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-xs transition-colors shrink-0 cursor-pointer whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {/* 03. Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'All', label: 'All Standards', count: '' },
          { key: 'Product', label: 'Product Standards', count: '12,416' },
          { key: 'Testing', label: 'Testing Methods', count: '6,322' },
          { key: 'Safety', label: 'Safety Standards', count: '4,216' },
          { key: 'Code of Practice', label: 'Codes of Practice', count: '3,110' },
          { key: 'Terminology', label: 'Terminology', count: '2,801' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTypeTab(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
              activeTypeTab === tab.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && <span className={activeTypeTab === tab.key ? 'text-blue-100' : 'text-slate-400'}>({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* 04. 2-Column Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Facets Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-6">
          {/* Industry Facet */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Industry</h3>
              {selectedIndustries.length > 0 && (
                <button
                  onClick={() => setSelectedIndustries([])}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {visibleIndustries.map((ind) => (
                <label key={ind.label} className="flex items-center justify-between text-xs cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(ind.label)}
                      onChange={() => toggleIndustry(ind.label)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span className="text-slate-700 group-hover:text-slate-900">{ind.label}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">({ind.count})</span>
                </label>
              ))}
              <button 
                type="button"
                onClick={() => setShowAllIndustries(!showAllIndustries)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 pt-1 block cursor-pointer"
              >
                {showAllIndustries ? '- Show less' : '+ Show more'}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Status</h3>
            <div className="space-y-2.5">
              {statuses.map((st) => (
                <label key={st.label} className="flex items-center justify-between text-xs cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(st.label)}
                      onChange={() => toggleStatus(st.label)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span className="text-slate-700 group-hover:text-slate-900">{st.label}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">({st.count})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Since Year</h3>
              <span className="text-xs font-mono font-bold text-blue-600">{minYear}</span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="1970"
                max="2024"
                step="1"
                value={minYear}
                onChange={(e) => setMinYear(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>1970</span>
                <span>2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Standards List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Sort / Counter Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="font-medium">
              Showing <strong className="text-slate-800 font-mono">{filteredStandards.length}</strong> matching standards
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-2 pr-6 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Latest">Latest Year</option>
                  <option value="Popular">Most Referenced</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3.5">
            {filteredStandards.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <p className="text-sm font-semibold text-slate-700">No standards match your filters.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the publication year slider or clearing industry checkboxes.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustries([]);
                    setMinYear(1970);
                    setActiveTypeTab('All');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredStandards.map((std) => {
                const inBasket = isInBasket(std.code);
                return (
                  <div
                    key={std.id}
                    className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => navigate(`/standards/${std.code}`)}
                            className="font-extrabold text-slate-900 text-sm sm:text-base font-mono hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <span>{std.code}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {std.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Year: {std.year}
                          </span>
                        </div>

                        <h2 
                          onClick={() => navigate(`/standards/${std.code}`)}
                          className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {std.title}
                        </h2>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {std.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50/70 text-blue-700 border border-blue-100 whitespace-nowrap shrink-0"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                        <button
                          onClick={() => handleBasketToggle(std)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                            inBasket
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                          }`}
                        >
                          {inBasket ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>In Basket</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add to Basket</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => navigate('/graph')}
                          className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>View Graph</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Metadata Footer */}
                    <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-4">
                        <span>Reaffirmed: <strong className="text-slate-600">{std.reaffirmed}</strong></span>
                        <span>Related: <strong className="text-slate-600">{std.relatedCount}</strong></span>
                        <span>Industry: <strong className="text-slate-600">{std.industry}</strong></span>
                      </div>
                      <span className="text-slate-400">BIS Division: Electrotechnical</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
