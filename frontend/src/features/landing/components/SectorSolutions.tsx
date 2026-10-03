import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Building2, Box, ShieldCheck, ArrowRight, Award } from 'lucide-react';

export const SectorSolutions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manufacturing' | 'infrastructure' | 'consumer' | 'quality'>('manufacturing');

  const sectors = [
    {
      id: 'manufacturing' as const,
      label: 'Manufacturing',
      icon: Factory,
      headline: 'Heavy Industry, Metallurgy & Machinery Procurement',
      desc: 'Ensure raw material inputs, welded components, and pressure vessels adhere to the latest BIS product certifications and mandatory Ministry of Steel QCOs.',
      standards: ['IS 2062:2011 (Hot Rolled Steel)', 'IS 1239:2004 (Steel Tubes & Fittings)', 'IS 1367 (Fasteners)'],
      metrics: '4,200+ Standards • 100% Mandatory QCO Coverage',
      cta: 'Explore Manufacturing Standards',
      path: '/standards'
    },
    {
      id: 'infrastructure' as const,
      label: 'Infrastructure',
      icon: Building2,
      headline: 'Civil Works, Roads, Bridges & Public Infrastructure',
      desc: 'Formulate CPWD-compliant tenders with validated code references for high-strength deformed bars, ready-mixed concrete, and earthquake-resistant designs.',
      standards: ['IS 456:2000 (Plain & Reinforced Concrete)', 'IS 1786:2023 (TMT Steel Bars)', 'IS 1893 (Earthquake Criteria)'],
      metrics: '3,800+ Standards • Full CPWD & MoRTH Harmonization',
      cta: 'Explore Infrastructure Codes',
      path: '/standards'
    },
    {
      id: 'consumer' as const,
      label: 'Consumer Products',
      icon: Box,
      headline: 'Electronics, Electrical Appliances & Packaged Goods',
      desc: 'Navigate the Compulsory Registration Scheme (CRS) for electronics, battery safety standards, and BIS mark licensing requirements seamlessly.',
      standards: ['IS 13252:2010 (IT Equipment Safety)', 'IS 16046:2018 (Lithium Batteries)', 'IS 302 (Household Electrical)'],
      metrics: '2,900+ Standards • CRS & ISI Mark Verification',
      cta: 'Explore Consumer Compliance',
      path: '/standards'
    },
    {
      id: 'quality' as const,
      label: 'Quality Teams',
      icon: ShieldCheck,
      headline: 'Testing Laboratories, QA Reviewers & Inspection Bodies',
      desc: 'Validate test methods, sampling frequencies, and tolerance thresholds against NABL accredited testing specifications and Bureau of Indian Standards manuals.',
      standards: ['IS 1608:2022 (Tensile Testing of Metals)', 'IS 516:2021 (Hardened Concrete Tests)', 'IS 3025 (Water Testing)'],
      metrics: '5,500+ Test Methods • Zero Discrepancy Audits',
      cta: 'Explore Quality & Test Codes',
      path: '/standards'
    },
  ];

  const currentSector = sectors.find(s => s.id === activeTab) || sectors[0];

  return (
    <section className="py-20 bg-[#faf8f5] border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-800">
            Tailored Industry Solutions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 mt-3 mb-4">
            Standards Intelligence Across Every Sector
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Whether you are building national highways or procuring precision electrical equipment, BISense delivers domain-specific rigor.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {sectors.map((s) => {
            const Icon = s.icon;
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-orange-600'}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>{currentSector.metrics}</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              {currentSector.headline}
            </h3>

            <p className="text-slate-600 text-base leading-relaxed mb-6 font-sans">
              {currentSector.desc}
            </p>

            <div className="space-y-2 mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Governed Standards:
              </p>
              {currentSector.standards.map((std, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>{std}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(currentSector.path)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-full shadow-md transition-all cursor-pointer group"
            >
              <span>{currentSector.cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="md:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/90 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <currentSector.icon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-1">
              {currentSector.label} Workbench
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Instant access to curated taxonomy, amendment alerts, and compliance matrices tailored for {currentSector.label.toLowerCase()} teams.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Open in Dashboard
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SectorSolutions;
