import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  BookOpen, 
  Activity, 
  Share2, 
  ShieldCheck, 
  BarChart3, 
  Star, 
  Bell, 
  HelpCircle,
  ChevronsLeft,
  ChevronRight
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface NavItem {
  path: string;
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'basket' | 'alerts';
}

const mainNavItems: NavItem[] = [
  { path: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/procurements', key: 'procurements', label: 'Procurements', icon: Briefcase },
  { path: '/review', key: 'review', label: 'Review', icon: FileText },
  { path: '/standards', key: 'standards', label: 'Standards', icon: BookOpen },
  { path: '/tender-health', key: 'tenderHealth', label: 'Tender Health', icon: Activity },
  { path: '/graph', key: 'knowledgeGraph', label: 'Knowledge Graph', icon: Share2 },
  { path: '/evidence', key: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { path: '/export', key: 'reports', label: 'Reports', icon: BarChart3 },
  { path: '/basket', key: 'watchlist', label: 'Watchlist', icon: Star },
];

const resourceNavItems: NavItem[] = [
  { path: '/changes', key: 'updates', label: 'Updates', icon: Bell, badgeKey: 'alerts' },
  { path: '/components', key: 'guides', label: 'Guides', icon: BookOpen },
  { path: '/settings', key: 'help', label: 'Help & Support', icon: HelpCircle },
];

export function Sidebar() {
  const { unreadAlertsCount } = useStandIQ();

  return (
    <aside className="w-full md:w-64 border-r border-slate-200/90 bg-white flex flex-col h-full overflow-y-auto select-none">
      {/* Brand Header - exact height to match top header */}
      <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <NavLink to="/landing" className="flex items-center gap-2.5 group" title="Return to Landing Page">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="BISense Logo" className="w-7 h-7 object-contain transition-transform group-hover:scale-105" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">BISense</span>
            </div>
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase block -mt-0.5">STANDARDS INTELLIGENCE</span>
          </div>
        </NavLink>

        <button 
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex flex-col py-3 px-3 gap-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-50/90 text-orange-600 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Resources Header */}
        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Resources
          </span>
        </div>

        {/* Resources Items */}
        {resourceNavItems.map((item) => {
          const Icon = item.icon;
          const hasAlerts = item.badgeKey === 'alerts' && unreadAlertsCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-50/90 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </div>

                  {/* Indicator Dot */}
                  {hasAlerts && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pinned Bottom Registry Status Card */}
      <div className="mt-auto p-3 border-t border-slate-100">
        <NavLink
          to="/changes"
          className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                BIS Registry Live
              </p>
              <p className="text-[10px] text-slate-400">
                Last synced 2 min ago
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
