import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  Activity, 
  Share2, 
  FileCheck2, 
  Bell, 
  Settings as SettingsIcon
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface NavItem {
  path: string;
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'basket' | 'alerts';
}

const coreNavItems: NavItem[] = [
  { path: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/procurements', key: 'procurements', label: 'Procurements', icon: Briefcase },
  { path: '/review', key: 'review', label: 'Review', icon: FileCheck2 },
  { path: '/standards', key: 'standards', label: 'Standards', icon: BookOpen },
  { path: '/tender-health', key: 'tenderHealth', label: 'Tender Health', icon: Activity },
  { path: '/graph', key: 'knowledgeGraph', label: 'Knowledge Graph', icon: Share2 },
  { path: '/changes', key: 'changesAlerts', label: 'Changes & Alerts', icon: Bell, badgeKey: 'alerts' },
];

export function Sidebar() {
  const { unreadAlertsCount } = useStandIQ();

  return (
    <aside className="w-full md:w-64 border-r border-slate-200/90 bg-white flex flex-col h-full overflow-y-auto select-none">
      {/* Brand Header - exact h-14 to match top header border line seamlessly */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-10 flex items-center justify-center shrink-0">
          <img src="/emblem.png" alt="Emblem of India" className="w-7 h-9 object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900">BISense</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block -mt-0.5">STANDARDS INTELLIGENCE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col py-3 px-3 gap-1">
        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey === 'alerts' ? unreadAlertsCount : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </div>

                  {badgeCount > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-4 text-center shrink-0 whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
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

      {/* Pinned Bottom Section */}
      <div className="mt-auto border-t border-slate-100 flex flex-col shrink-0">
        <div className="p-2.5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`
            }
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span>System &amp; API Settings</span>
          </NavLink>
        </div>

        {/* Bottom Registry Status Bar */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-600 font-medium">BIS REGISTRY LIVE</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.4</span>
        </div>
      </div>
    </aside>
  );
}
