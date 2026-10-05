import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Bell, 
  AlertTriangle, 
  Info 
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Latest Standards matching Image 1
  const latestStandards = [
    {
      code: 'IS 1786:2023',
      title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification',
      tags: [
        { label: 'Construction', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
        { label: 'Latest', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' }
      ],
      date: '15 Sep 2026'
    },
    {
      code: 'IS 3025 (Part 39):2021',
      title: 'Methods of Sampling and Test (Water and Waste Water) — Part 39: pH Value',
      tags: [
        { label: 'Environment', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' }
      ],
      date: '12 Sep 2026'
    },
    {
      code: 'IS 14543:2022',
      title: 'Plain and Reinforced Concrete — Code of Practice',
      tags: [
        { label: 'Civil Engineering', color: 'bg-purple-50 text-purple-700 border-purple-200/60' }
      ],
      date: '11 Sep 2026'
    },
    {
      code: 'IS 1293:2019',
      title: 'Specification for Mild Steel Wire for General Purpose — Specification',
      tags: [
        { label: 'Metallurgical', color: 'bg-amber-50 text-amber-700 border-amber-200/60' }
      ],
      date: '08 Sep 2026'
    },
    {
      code: 'IS 16046:2018',
      title: 'Packaging — Code of Practice',
      tags: [
        { label: 'Consumer Products', color: 'bg-blue-50 text-blue-700 border-blue-200/60' }
      ],
      date: '05 Sep 2026'
    }
  ];

  // Active Alerts matching Image 1
  const activeAlerts = [
    {
      id: 'alert-1',
      type: 'critical',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      title: 'Ordinary Portland Cement 43 Grade',
      subtitle: '22% unresolved compliance requirements',
      time: '2h ago',
      path: '/review'
    },
    {
      id: 'alert-2',
      type: 'warning',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600',
      title: '3 standards updated by BIS',
      subtitle: 'Affects IS 12615:2018 (Energy Efficient Motors)',
      time: '5h ago',
      path: '/changes'
    },
    {
      id: 'alert-3',
      type: 'info-blue',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Fe 500D TMT Steel Rebars',
      subtitle: 'Pending mandatory statutory QCO verification',
      time: '1d ago',
      path: '/standards'
    },
    {
      id: 'alert-4',
      type: 'info-slate',
      icon: Info,
      iconBg: 'bg-slate-100 text-slate-600',
      title: '2 tenders require technical clause review',
      subtitle: '415V Low Voltage Switchgear & Solar PV Inverter drafts',
      time: '1d ago',
      path: '/tender-health'
    }
  ];

  return (
    <div className="min-h-full bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Hero Welcome Banner */}
      <div className="relative bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[230px] flex flex-col md:flex-row items-center justify-between">
        
        {/* Full Right Panorama Architectural Graphic */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[60%] lg:w-[56%] pointer-events-none overflow-hidden">
          <img 
            src="/parliament.png" 
            alt="Indian Parliament" 
            className="w-full h-full object-cover object-right-top md:object-right opacity-95"
          />
          {/* Subtle smooth gradient fade on the left edge into white card */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent w-1/3" />
        </div>

        {/* Left Text & Call-To-Action Area */}
        <div className="relative z-10 p-6 md:p-8 lg:p-10 flex-1 max-w-xl">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              STANDARDS INTELLIGENCE
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight text-slate-900 leading-tight">
            Good morning, <span className="text-orange-500 font-serif font-normal">Anirudh</span>
          </h1>

          <p className="text-slate-500 text-sm md:text-base mt-2 mb-6">
            Turn BIS information into clear insights and compliant actions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Action Button: + New Analysis */}
            <button
              onClick={() => navigate('/procurements/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs md:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis</span>
            </button>

            {/* Secondary Button: Explore Standards */}
            <button
              onClick={() => navigate('/standards')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold text-xs md:text-sm shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Explore Standards</span>
            </button>
          </div>
        </div>

        {/* Right Floating Quote Card */}
        <div className="relative z-10 mr-4 md:mr-8 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm max-w-[270px] self-start mt-4 hidden sm:block">
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-serif font-black text-2xl leading-none select-none">
              “
            </span>
            <div>
              <p className="text-[11px] font-medium text-slate-800 leading-snug">
                Building a compliant and self-reliant India with Standards.
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-normal text-right">
                — Bureau of Indian Standards
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Lower Grid Layout: Latest Standards | Compliance & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Latest Standards Card (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs p-5 md:p-6 flex flex-col">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <FileText className="w-4 h-4 text-orange-500" />
              </div>
              <h2 className="font-bold text-base md:text-lg text-slate-900 tracking-tight">
                Latest Standards
              </h2>
            </div>

            <button
              onClick={() => navigate('/standards')}
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Standards List */}
          <div className="divide-y divide-slate-50">
            {latestStandards.map((std, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/standards/${encodeURIComponent(std.code)}`)}
                className="py-3.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                      <span>{std.code}</span>
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-500 truncate mt-0.5">
                      {std.title}
                    </p>

                    {/* Category Tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {std.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tag.color}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Date & Chevron */}
                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                    {std.date}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Compliance Overview & Active Alerts (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Compliance Overview */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs p-5 md:p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="font-bold text-base text-slate-900 tracking-tight">
                  Compliance Overview
                </h2>
              </div>

              <button
                onClick={() => navigate('/evidence')}
                className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Donut Chart & Legend Row */}
            <div className="flex items-center justify-around gap-4 pt-2 pb-1">
              
              {/* Circular Donut Ring */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="9"
                  />
                  {/* Compliant 78% (Green) - Circumference 251.3 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="9"
                    strokeDasharray="196 251.3"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* In Progress 15% (Amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="9"
                    strokeDasharray="37.7 251.3"
                    strokeDashoffset="-198"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Donut Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    78%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Compliant
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-3 min-w-[130px]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Compliant</span>
                  </div>
                  <span className="font-bold text-slate-900">78%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 font-medium">In Progress</span>
                  </div>
                  <span className="font-bold text-slate-900">15%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-600 font-medium">Not Started</span>
                  </div>
                  <span className="font-bold text-slate-900">7%</span>
                </div>
              </div>

            </div>

          </div>

          {/* Card 2: Active Alerts */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs p-5 md:p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <Bell className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="font-bold text-base text-slate-900 tracking-tight">
                  Active Alerts
                </h2>
              </div>

              <button
                onClick={() => navigate('/changes')}
                className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alerts List */}
            <div className="space-y-1.5">
              {activeAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div
                    key={alert.id}
                    onClick={() => navigate(alert.path)}
                    className="p-2.5 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-lg ${alert.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                          {alert.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {alert.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-right">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {alert.time}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
