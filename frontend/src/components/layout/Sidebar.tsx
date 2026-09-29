import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  Activity, 
  Share2, 
  FileCheck2, 
  ShoppingBag, 
  FileCode2, 
  CheckSquare, 
  Download, 
  Bell, 
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface NavItem {
  path: string;
  key: string;
  defaultLabel: string;
  num: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'basket' | 'alerts';
}

const navItems: NavItem[] = [
  { path: '/dashboard', key: 'dashboard', defaultLabel: 'Dashboard', num: '01', icon: LayoutDashboard },
  { path: '/procurements', key: 'procurements', defaultLabel: 'Procurements', num: '02', icon: Briefcase },
  { path: '/standards', key: 'standards', defaultLabel: 'Standards', num: '03', icon: BookOpen },
  { path: '/tender-health', key: 'tenderHealth', defaultLabel: 'Tender Health', num: '04', icon: Activity },
  { path: '/graph', key: 'knowledgeGraph', defaultLabel: 'Knowledge Graph', num: '05', icon: Share2 },
  { path: '/review', key: 'review', defaultLabel: 'Review', num: '06', icon: FileCheck2 },
  { path: '/basket', key: 'standardsBasket', defaultLabel: 'Standards Basket', num: '07', icon: ShoppingBag, badgeKey: 'basket' },
  { path: '/specification-builder', key: 'specificationBuilder', defaultLabel: 'Specification Builder', num: '08', icon: FileCode2 },
  { path: '/approval', key: 'approval', defaultLabel: 'Approval', num: '09', icon: CheckSquare },
  { path: '/export', key: 'export', defaultLabel: 'Export', num: '10', icon: Download },
  { path: '/changes', key: 'changesAlerts', defaultLabel: 'Changes & Alerts', num: '11', icon: Bell, badgeKey: 'alerts' },
  { path: '/settings', key: 'settings', defaultLabel: 'Settings', num: '12', icon: SettingsIcon },
];

export function Sidebar() {
  const { basket, unreadAlertsCount, t } = useStandIQ();

  return (
    <aside className="w-full md:w-64 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">BISense</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200/60">BIS</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block -mt-0.5">STANDARDS INTELLIGENCE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 py-3 px-3 gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey === 'basket' 
            ? basket.length 
            : item.badgeKey === 'alerts' 
              ? unreadAlertsCount 
              : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[11px] font-mono tracking-tight ${isActive ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {item.num}
                    </span>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="truncate whitespace-nowrap">{t(item.key) || item.defaultLabel}</span>
                  </div>

                  {badgeCount > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full min-w-4 text-center shrink-0 whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : item.badgeKey === 'alerts' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 mt-auto flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] text-slate-600 font-medium">BIS REGISTRY LIVE</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">v2.4</span>
      </div>
    </aside>
  );
}
