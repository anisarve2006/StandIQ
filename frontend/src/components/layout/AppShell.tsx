import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Menu, 
  X,
  Sun
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { GlobalSearch } from '../search/GlobalSearch';

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, unreadAlertsCount, t, theme, setTheme } = useStandIQ();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block md:w-64 md:h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl z-10 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global StandIQ Top Header Bar */}
        <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-10 shadow-xs">
          {/* Mobile menu toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-slate-900 text-sm">BISense</span>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <GlobalSearch 
              triggerButton={
                <div className="flex items-center justify-between w-full h-9 px-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg cursor-pointer transition-colors text-slate-400 group">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>{t('searchPlaceholder')}</span>
                  </div>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400 font-semibold shadow-2xs">
                    ⌘K
                  </kbd>
                </div>
              }
            />
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            {/* Eye-Comfort Warmth Toggle */}
            <button
              onClick={() => {
                const nextTheme = theme === 'Soothing' ? 'Dark' : theme === 'Dark' ? 'Light' : 'Soothing';
                setTheme(nextTheme as any);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all bg-amber-50/90 hover:bg-amber-100 text-amber-800 border border-amber-200/90 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
              title={`Active Mode: ${theme === 'Soothing' ? 'Warm Eye-Comfort Paper (Anti-Strain)' : theme === 'Dark' ? 'Midnight Slate' : 'Clean Studio Light'}. Click to toggle.`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-medium whitespace-nowrap">
                {theme === 'Soothing' ? 'Eye-Comfort Warmth' : theme === 'Dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>

            {/* Notifications Alert Bell */}
            <Link
              to="/changes"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              title="Notifications & Amendments"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>

            {/* Help & Documentation */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:block shrink-0"
              title="Help & System Info"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="relative shrink-0">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {user.initials}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block whitespace-nowrap">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user.name} Sarve</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200/50">
                      {user.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link to="/settings" className="block px-3 py-1.5 rounded-md hover:bg-slate-50 text-slate-700">Settings</Link>
                    <Link to="/basket" className="block px-3 py-1.5 rounded-md hover:bg-slate-50 text-slate-700">Standards Basket</Link>
                    <Link to="/approval" className="block px-3 py-1.5 rounded-md hover:bg-slate-50 text-slate-700">Approval Queue</Link>
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <div className="px-3 py-1.5 text-slate-400 text-[11px] flex items-center justify-between">
                      <span>BIS Portal Sync</span>
                      <span className="text-emerald-600 font-medium">Connected</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
