import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/Button';

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden">
      {/* Mobile Header & Nav Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border absolute top-0 w-full bg-background z-20">
        <span className="label text-text-primary">PROCUREMENT INTEL</span>
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? 'CLOSE' : 'MENU'}
        </Button>
      </div>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${mobileMenuOpen ? 'block absolute z-10 top-16 bottom-0 w-full' : 'hidden'} md:block md:static md:h-full md:w-64 shrink-0`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative">
        <Outlet />
      </main>
    </div>
  );
}
