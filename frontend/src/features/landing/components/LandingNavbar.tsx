import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, ChevronDown } from 'lucide-react';
import BISenseLogo from './BISenseLogo';

interface LandingNavbarProps {
  onBookDemoClick: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onBookDemoClick }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const handleLoginClick = () => {
    // As per user specification: Login part redirects directly to dashboard
    navigate('/dashboard');
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center cursor-pointer group"
          >
            <BISenseLogo size="md" />
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('standards-section')}
              className="text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Standards
            </button>
            <button
              onClick={() => scrollToSection('knowledge-graph-section')}
              className="text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Knowledge Graph
            </button>
            <button
              onClick={() => scrollToSection('compliance-section')}
              className="text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Compliance
            </button>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180 text-orange-600' : 'text-slate-400'}`} />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div 
                    onClick={() => { setResourcesOpen(false); navigate('/standards'); }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-900">BIS Gazette Updates</p>
                    <p className="text-[11px] text-slate-500">Live feed of amendments & QCOs</p>
                  </div>
                  <div 
                    onClick={() => { setResourcesOpen(false); navigate('/tender-health'); }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-900">Tender Health Inspector</p>
                    <p className="text-[11px] text-slate-500">Audit procurement specifications</p>
                  </div>
                  <div 
                    onClick={() => { setResourcesOpen(false); navigate('/graph'); }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-900">Interactive Graph Explorer</p>
                    <p className="text-[11px] text-slate-500">Visualize dependency networks</p>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Login button -> directly redirects to dashboard */}
            <button
              id="landing-login-btn"
              onClick={handleLoginClick}
              className="px-5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 rounded-full transition-all duration-200 shadow-xs cursor-pointer active:scale-95"
            >
              Login
            </button>

            {/* Book a demo button */}
            <button
              id="landing-book-demo-btn"
              onClick={onBookDemoClick}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow group cursor-pointer active:scale-95"
            >
              <span>Book a demo</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={handleLoginClick}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-full"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => scrollToSection('standards-section')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            Standards
          </button>
          <button
            onClick={() => scrollToSection('knowledge-graph-section')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => scrollToSection('compliance-section')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            Compliance
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            Resources & Workspace
          </button>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleLoginClick}
              className="w-full text-center py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl"
            >
              Login to Dashboard
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onBookDemoClick(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl"
            >
              <span>Book a demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
