import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  ChevronsLeft,
  Home,
  Share2,
  ShieldCheck,
  FolderKanban,
  Briefcase,
  Star,
  Clock,
  FileQuestion,
  FileText,
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import BISenseLogo from './BISenseLogo';

export const HeroMockupPreview: React.FC = () => {
  const navigate = useNavigate();

  const goToDashboard = (targetPath: string = '/dashboard') => {
    navigate(targetPath);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* Outer Glow / Soft Ambient Depth */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 via-amber-300/15 to-orange-500/20 rounded-3xl blur-2xl opacity-60 -z-10 transform scale-95" />

      {/* Main Mockup Container */}
      <div 
        onClick={() => goToDashboard('/dashboard')}
        className="group relative bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden transition-all duration-300 hover:border-orange-300/70 hover:shadow-[0_25px_70px_-15px_rgba(234,88,12,0.15)] cursor-pointer"
        title="Click anywhere to open the live interactive dashboard"
      >
        {/* Floating Quick Action Badge */}
        <div className="absolute top-3 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-medium shadow-md backdrop-blur-xs">
            <span>Open live dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        {/* Mockup Frame Layout */}
        <div className="flex h-[520px] sm:h-[580px] lg:h-[640px] text-slate-800 text-xs md:text-sm select-none overflow-hidden">
          
          {/* Mockup Left Sidebar */}
          <aside className="w-44 md:w-56 lg:w-60 border-r border-slate-100 bg-white flex flex-col shrink-0">
            {/* Sidebar Brand Header */}
            <div className="h-14 px-3.5 border-b border-slate-100 flex items-center justify-between">
              <BISenseLogo size="sm" />
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Main Navigation */}
            <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
              {/* Home - Active */}
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-orange-50 text-orange-600 font-semibold transition-colors">
                <Home className="w-4 h-4 text-orange-500" />
                <span>Home</span>
              </div>

              {/* Search Standards */}
              <div 
                onClick={(e) => { e.stopPropagation(); goToDashboard('/standards'); }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search Standards</span>
              </div>

              {/* Knowledge Graph */}
              <div 
                onClick={(e) => { e.stopPropagation(); goToDashboard('/graph'); }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Knowledge Graph</span>
              </div>

              {/* Compliance */}
              <div 
                onClick={(e) => { e.stopPropagation(); goToDashboard('/tender-health'); }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Compliance</span>
              </div>

              {/* My Workspace */}
              <div 
                onClick={(e) => { e.stopPropagation(); goToDashboard('/procurements'); }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <span>My Workspace</span>
              </div>

              {/* Projects */}
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>Projects</span>
              </div>

              {/* Watchlist */}
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                <Star className="w-4 h-4 text-slate-400" />
                <span>Watchlist</span>
              </div>

              {/* Resources Divider */}
              <div className="pt-4 pb-1 px-2.5">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Resources
                </span>
              </div>

              {/* Updates */}
              <div 
                onClick={(e) => { e.stopPropagation(); goToDashboard('/changes'); }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs">Updates</span>
              </div>

              {/* Guides */}
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs">Guides</span>
              </div>

              {/* Help & Support */}
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs">Help & Support</span>
              </div>
            </div>
          </aside>

          {/* Mockup Main Viewport */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#fbfcfd] overflow-y-auto">
            {/* Mockup Top Header */}
            <div className="h-14 px-4 border-b border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search BIS standards, keywords, products, IS numbers..."
                    className="w-full pl-8 pr-28 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden cursor-pointer"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1.5">
                    <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                      Ctrl K
                    </span>
                    <button className="px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-md">
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Right User Bar */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Bell */}
                <div className="relative p-1.5 text-slate-500 hover:text-slate-800 rounded-lg">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                </div>

                {/* Avatar & Org */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    AS
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                      <span>Anirudh Sarve</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400">Organization</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Dashboard Content Canvas */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-5">
              
              {/* Welcome Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    Welcome back, Anirudh
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Discover. Understand. Comply.
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: BIS Standards */}
                <div className="bg-white p-3 md:p-3.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-slate-900 leading-none">
                      1,240+
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      BIS Standards
                    </div>
                  </div>
                </div>

                {/* Metric 2: Active Projects */}
                <div className="bg-white p-3 md:p-3.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <FolderKanban className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-slate-900 leading-none">
                      12
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      Active Projects
                    </div>
                  </div>
                </div>

                {/* Metric 3: Compliance Tasks */}
                <div className="bg-white p-3 md:p-3.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-slate-900 leading-none">
                      8
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      Compliance Tasks
                    </div>
                  </div>
                </div>

                {/* Metric 4: Updates this week */}
                <div className="bg-white p-3 md:p-3.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                    <Bell className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-slate-900 leading-none">
                      3
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      Updates this week
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Columns Grid: Latest Standards | Knowledge Graph | Compliance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Column 1: Latest Standards (Span 4) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                      Latest Standards
                    </h3>
                    <span 
                      onClick={(e) => { e.stopPropagation(); goToDashboard('/standards'); }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                    >
                      View all <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {/* Item 1: IS 1786:2023 */}
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          IS 1786:2023
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          High Strength Deformed Steel Bars and Wires...
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Construction
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Latest
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item 2: IS 3025 (Part 39):2021 */}
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          IS 3025 (Part 39):2021
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Methods of Sampling and Test (Water and Waste...
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                            Environment
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item 3: IS 14543:2022 */}
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          IS 14543:2022
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Plain and Reinforced Concrete — Code of Practice
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/60">
                            Civil Engineering
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item 4: IS 1293:2019 */}
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          IS 1293:2019
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Specification for Mild Steel Wire for General Pur...
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                            Metallurgical
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Knowledge Graph (Span 5) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                      Knowledge Graph
                    </h3>
                    <span 
                      onClick={(e) => { e.stopPropagation(); goToDashboard('/graph'); }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                    >
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* SVG Knowledge Graph Network */}
                  <div className="relative flex-1 min-h-[220px] bg-slate-50/50 rounded-lg p-2 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full max-h-[240px]" viewBox="0 0 360 220" fill="none">
                      {/* Connector Lines */}
                      {/* IS 456 -> IS 383 */}
                      <line x1="180" y1="110" x2="230" y2="40" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
                      {/* IS 456 -> IS 9103 */}
                      <line x1="180" y1="110" x2="280" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* IS 456 -> IS 1199 */}
                      <line x1="180" y1="110" x2="250" y2="175" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* IS 456 -> IS 516 */}
                      <line x1="180" y1="110" x2="110" y2="175" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
                      {/* IS 456 -> IS 10262 */}
                      <line x1="180" y1="110" x2="90" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Nodes */}
                      {/* Center Node: IS 456:2000 (Current) */}
                      <circle cx="180" cy="110" r="14" fill="#f97316" className="drop-shadow-sm" />
                      <circle cx="180" cy="110" r="19" fill="#f97316" opacity="0.2" className="animate-pulse" />
                      <text x="180" y="136" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">IS 456:2000</text>
                      <text x="180" y="146" textAnchor="middle" fontSize="7.5" fill="#64748b">Plain and Reinforced Concrete</text>

                      {/* Top Node: IS 383 (Related To - Green) */}
                      <circle cx="230" cy="40" r="8" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
                      <text x="242" y="38" fontSize="8" fontWeight="700" fill="#0f172a">IS 383</text>
                      <text x="242" y="47" fontSize="7" fill="#64748b">Coarse and Fine Aggregates</text>

                      {/* Right Node: IS 9103 (Related Standard - Blue) */}
                      <circle cx="280" cy="105" r="8" fill="#93c5fd" stroke="#2563eb" strokeWidth="1.5" />
                      <text x="292" y="104" fontSize="8" fontWeight="700" fill="#0f172a">IS 9103</text>
                      <text x="292" y="113" fontSize="7" fill="#64748b">Admixtures for Concrete</text>

                      {/* Bottom Right Node: IS 1199 (Related To - Green) */}
                      <circle cx="250" cy="175" r="8" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
                      <text x="262" y="174" fontSize="8" fontWeight="700" fill="#0f172a">IS 1199</text>
                      <text x="262" y="183" fontSize="7" fill="#64748b">Cement</text>

                      {/* Bottom Left Node: IS 516 (Referenced In - Purple) */}
                      <circle cx="110" cy="175" r="8" fill="#d8b4fe" stroke="#9333ea" strokeWidth="1.5" />
                      <text x="100" y="174" textAnchor="end" fontSize="8" fontWeight="700" fill="#0f172a">IS 516</text>
                      <text x="100" y="183" textAnchor="end" fontSize="7" fill="#64748b">Methods of Tests for Strength</text>

                      {/* Top Left Node: IS 10262 (Related Standard - Blue) */}
                      <circle cx="90" cy="80" r="8" fill="#93c5fd" stroke="#2563eb" strokeWidth="1.5" />
                      <text x="80" y="79" textAnchor="end" fontSize="8" fontWeight="700" fill="#0f172a">IS 10262</text>
                      <text x="80" y="88" textAnchor="end" fontSize="7" fill="#64748b">Concrete Mix Design</text>
                    </svg>

                    {/* Graph Legend */}
                    <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-center gap-3 text-[9px] text-slate-600 bg-white/80 py-1 px-2 rounded backdrop-blur-xs border border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>Current Standard</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>Related Standard</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>Referenced In</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Related To</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Compliance & Recommendations (Span 3) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Compliance Overview */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                        Compliance Overview
                      </h3>
                      <span 
                        onClick={(e) => { e.stopPropagation(); goToDashboard('/tender-health'); }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      {/* Donut Chart */}
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          {/* Background Ring */}
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                          {/* Compliant Segment 78% (green) */}
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.5"
                            strokeDasharray="68.6 88"
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />
                          {/* In Progress Segment 15% (amber) */}
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3.5"
                            strokeDasharray="13.2 88"
                            strokeDashoffset="-69"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-extrabold text-slate-900 leading-none">78%</span>
                          <span className="text-[7px] text-slate-400 font-medium">Compliant</span>
                        </div>
                      </div>

                      {/* Legend List */}
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-slate-600">Compliant</span>
                          </div>
                          <span className="font-bold text-slate-900">78%</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-slate-600">In Progress</span>
                          </div>
                          <span className="font-bold text-slate-900">15%</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-slate-600">Not Started</span>
                          </div>
                          <span className="font-bold text-slate-900">7%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Standards */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                        Recommended Standards
                      </h3>
                      <span 
                        onClick={(e) => { e.stopPropagation(); goToDashboard('/standards'); }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                      >
                        See all <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-900">IS 16700:2017</span>
                            <span className="text-[8px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">Relevant</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">Food Safety Management Systems</p>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-900">IS 16046:2018</span>
                            <span className="text-[8px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">Relevant</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">Packaging — Code of Practice</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </main>
        </div>

        {/* Bottom Banner inside Mockup: "Live Interactive Workbench" */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-slate-300">Live Production Preview</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">Click anywhere to launch the full BISense workspace</span>
          </div>
          <button 
            onClick={() => goToDashboard('/dashboard')}
            className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
          >
            <span>Launch Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroMockupPreview;
