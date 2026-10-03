import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Share2, ShieldCheck, FileCheck, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export const PillarsSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'standards-section',
      icon: Search,
      tag: 'Semantic Search Engine',
      title: 'Discover Every Applicable Indian Standard in Seconds',
      description: 'Go beyond fragile keyword searches. Our domain-trained embedding model parses technical parameters (tensile yield, moisture content, voltage tolerances) and connects you to authoritative IS codes, active amendments, and gazette notifications.',
      bullets: [
        '21,000+ Indian Standards indexed and updated weekly',
        'Automatic detection of latest edition vs. obsolete editions',
        'Direct links to BIS Gazette notifications & Quality Control Orders (QCOs)'
      ],
      actionText: 'Explore Standards Discovery',
      actionPath: '/standards',
      color: 'orange',
    },
    {
      id: 'knowledge-graph-section',
      icon: Share2,
      tag: 'Dynamic Dependency Graph',
      title: 'Map Hidden Relationships Across the BIS Ecosystem',
      description: 'Never miss a referenced testing standard or required raw material code again. BISense builds an interactive multi-directional knowledge graph linking parent standards to compulsory test methods, sampling protocols, and safety norms.',
      bullets: [
        'Visualize multi-hop connections (e.g., Concrete IS 456 → Cement IS 1199 → Aggregates IS 383)',
        'Classify relationship types: Referenced In, Test Method, Mandatory Raw Material',
        'Interactive filtering by industry division and certification scheme'
      ],
      actionText: 'Open Interactive Graph',
      actionPath: '/graph',
      color: 'blue',
    },
    {
      id: 'compliance-section',
      icon: ShieldCheck,
      tag: 'Tender Health Inspector',
      title: 'Audit Procurement Specifications with Zero Blind Spots',
      description: 'Eliminate post-tender disputes and vendor disqualifications. Our automated compliance scanner inspects your RFP clauses, flags withdrawn or superseding standards, and guarantees compliance with Ministry Quality Control Orders.',
      bullets: [
        'Instant health score rating (0-100%) for any tender or BoQ clause',
        'Auto-replaces obsolete standard citations with current editions',
        'CVC & GeM procurement guideline compliance verification'
      ],
      actionText: 'Inspect Tender Health',
      actionPath: '/tender-health',
      color: 'emerald',
    },
    {
      id: 'spec-builder-section',
      icon: FileCheck,
      tag: 'Specification & Export Engine',
      title: 'Export Audit-Ready GeM BoQs & PDF Compliance Reports',
      description: 'Transform verified standard recommendations into legally sound tender documents. Generate tender-ready technical specification schedules, vendor qualification clauses, and detailed PDF audit trails with a single click.',
      bullets: [
        'One-click export to GeM (Government e-Marketplace) specification formats',
        'Automated generation of sampling frequencies & mandatory test certificates',
        'Complete verifiable PDF audit trail for internal review committees'
      ],
      actionText: 'Go to Workspace',
      actionPath: '/dashboard',
      color: 'purple',
    }
  ];

  return (
    <section id="features-overview" className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 tracking-tight leading-tight">
            Engineered for Precision in Public & Industrial Procurement
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-sans leading-relaxed">
            BISense combines deep language models with an authoritative Indian Standards graph database to eliminate guesswork and regulatory risk.
          </p>
        </div>

        {/* Feature Cards Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={feature.id}
                className="group relative bg-[#fafafc] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200/80 hover:border-orange-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Tag & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200/50">
                      {feature.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-orange-950 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6 font-sans">
                    {feature.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="space-y-2.5 mb-8">
                    {feature.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-4 border-t border-slate-200/60">
                  <button
                    onClick={() => navigate(feature.actionPath)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    <span>{feature.actionText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PillarsSection;
