import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Compass, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  MoreHorizontal, 
  Layers, 
  ShieldCheck, 
  Users
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, t, formatDate } = useStandIQ();

  const statCards = [
    {
      key: 'standardsIdentified',
      title: t('standardsIdentified'),
      value: '1,248',
      change: '+12% this month',
      changeType: 'positive',
      icon: Layers,
      color: 'blue'
    },
    {
      key: 'analysesCompleted',
      title: t('analysesCompleted'),
      value: '326',
      change: '+8% this month',
      changeType: 'positive',
      icon: CheckCircle2,
      color: 'purple'
    },
    {
      key: 'avgMatchConfidence',
      title: t('avgMatchConfidence'),
      value: '94%',
      change: '+5% this month',
      changeType: 'positive',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      key: 'departmentsUsing',
      title: t('departmentsUsing'),
      value: '12',
      change: '+2 this month',
      changeType: 'positive',
      icon: Users,
      color: 'amber'
    },
  ];

  const recentAnalyses = [
    {
      id: 'p-1',
      title: 'Electrical Distribution Panel',
      category: 'Electrical Equipment',
      status: 'Completed',
      statusColor: 'emerald',
      matchScore: 94,
      updated: '24 Sep 2026',
      route: '/tender-health'
    },
    {
      id: 'p-2',
      title: 'Cement Supply',
      category: 'Construction Materials',
      status: 'Completed',
      statusColor: 'emerald',
      matchScore: 89,
      updated: '22 Sep 2026',
      route: '/tender-health'
    },
    {
      id: 'p-3',
      title: 'Solar PV Modules',
      category: 'Renewable Energy',
      status: 'In Review',
      statusColor: 'amber',
      matchScore: 92,
      updated: '20 Sep 2026',
      route: '/tender-health'
    },
    {
      id: 'p-4',
      title: 'Fire Safety Equipment',
      category: 'Safety Equipment',
      status: 'Draft',
      statusColor: 'slate',
      matchScore: 87,
      updated: '18 Sep 2026',
      route: '/tender-health'
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">
      {/* 01. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-100 shadow-sm min-h-[190px] flex items-center">
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
              onClick={() => navigate('/review')}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('newAnalysis')}</span>
            </button>
            <button
              onClick={() => navigate('/standards')}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>{t('exploreStandards')}</span>
            </button>
          </div>
        </div>

        {/* Right Image: Indian Parliament (parliament.png) */}
        <div className="absolute right-0 top-0 bottom-0 w-5/12 lg:w-1/2 hidden md:block overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-transparent to-transparent z-10 w-24" />
          <img
            src="/parliament.png"
            alt="Indian Parliament"
            className="w-full h-full object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 22%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 22%, black 100%)'
            }}
          />
        </div>
      </div>

      {/* 02. Stat Cards Grid */}
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

      {/* 03. Recent Analyses Card & Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('recentAnalyses')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Procurement specifications analyzed against Indian Standards</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">{t('title')}</th>
                <th className="py-3 px-6">{t('category')}</th>
                <th className="py-3 px-6">{t('matchConfidence')}</th>
                <th className="py-3 px-6">{t('status')}</th>
                <th className="py-3 px-6">{t('updated')}</th>
                <th className="py-3 px-6 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAnalyses.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                    <span>{item.title}</span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${item.matchScore}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-800 font-mono text-[11px]">{item.matchScore}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'In Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.status === 'Completed' ? t('completed') : item.status === 'In Review' ? t('inReview') : t('draft')}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                    {formatDate(item.updated)}
                  </td>
                  <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => navigate(item.route)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Inspect analysis"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
