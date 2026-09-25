import { NavLink } from 'react-router-dom';
import { Label } from '../ui/Label';
import { GlobalSearch } from '../search/GlobalSearch';
import { ThemeToggle } from '../ThemeToggle';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', num: '01' },
  { path: '/procurements', label: 'Procurements', num: '02' },
  { path: '/standards', label: 'Standards', num: '03' },
  { path: '/tender-health', label: 'Tender Health', num: '04' },
  { path: '/graph', label: 'Knowledge Graph', num: '05' },
  { path: '/review', label: 'Review', num: '06' },
  { path: '/basket', label: 'Standards Basket', num: '07' },
  { path: '/specification-builder', label: 'Specification Builder', num: '08' },
  { path: '/approval', label: 'Approval', num: '09' },
  { path: '/export', label: 'Export', num: '10' },
  { path: '/changes', label: 'Changes & Alerts', num: '11' },
  { path: '/settings', label: 'Settings', num: '12' },
];

export function Sidebar() {
  return (
    <aside className="w-full md:w-64 border-r border-border bg-background flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-border flex flex-col gap-4">
        <div>
          <Label className="text-text-primary">PROCUREMENT INTEL</Label>
          <span className="metadata block mt-1">SYSTEM WORKBENCH</span>
        </div>
        <GlobalSearch 
          triggerButton={
            <div className="flex items-center justify-between p-2 border border-border bg-surface rounded-sm cursor-text hover:border-text-muted transition-colors">
              <span className="mono text-xs text-text-muted">SEARCH...</span>
              <span className="mono text-[10px] text-text-muted border border-border px-1 rounded-sm bg-background">⌘K</span>
            </div>
          }
        />
      </div>
      <nav className="flex flex-col flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-6 py-2.5 flex items-center gap-3 text-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:bg-surface ${
                isActive ? 'text-text-primary bg-surface' : 'text-text-secondary'
              }`
            }
          >
            <span className="mono text-text-muted">{item.num}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-border mt-auto flex items-center justify-between">
        <div className="mono text-xs text-text-muted">v1.0.0 — ONLINE</div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
