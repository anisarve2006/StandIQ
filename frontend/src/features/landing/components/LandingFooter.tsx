import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import BISenseLogo from './BISenseLogo';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Call to Action Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-8 md:p-12 mb-16 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="max-w-2xl text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Ready to modernize Indian Standards compliance for your team?
            </h3>
            <p className="text-orange-100 text-sm md:text-base">
              Try BISense on your current tender or project specification in seconds. No complex setup required.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white hover:bg-orange-50 text-slate-900 font-bold text-sm rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="mb-4">
              <BISenseLogo size="md" className="brightness-125" />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
              AI-powered standards intelligence platform built to empower Indian public procurement, engineering teams, and quality assurance bodies with verified BIS data.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>SIH-PS108 Solution • StandIQ Engine</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/standards')} className="hover:text-white transition-colors cursor-pointer">
                  Standards Discovery
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/graph')} className="hover:text-white transition-colors cursor-pointer">
                  Knowledge Graph
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tender-health')} className="hover:text-white transition-colors cursor-pointer">
                  Tender Health Inspector
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/changes')} className="hover:text-white transition-colors cursor-pointer">
                  Changes & Alerts
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Sectors */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Sectors
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/standards')} className="hover:text-white transition-colors cursor-pointer">
                  Civil & Infrastructure
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/standards')} className="hover:text-white transition-colors cursor-pointer">
                  Mechanical & Steel
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/standards')} className="hover:text-white transition-colors cursor-pointer">
                  Consumer Electronics
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/standards')} className="hover:text-white transition-colors cursor-pointer">
                  Chemical & Petroleum
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/standards')} className="hover:text-white transition-colors cursor-pointer">
                  Testing Laboratories
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>BIS Portal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>GeM Portal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Technical Docs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Compliance Guides
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} BISense (StandIQ). Developed for Smart India Hackathon PS-108.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-slate-400 transition-colors">
              Terms of Use
            </button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-slate-400 transition-colors">
              Security
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
