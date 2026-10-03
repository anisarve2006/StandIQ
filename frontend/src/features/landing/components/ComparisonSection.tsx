import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const navigate = useNavigate();

  const comparisons = [
    {
      parameter: 'Standard Discovery Speed',
      manual: 'Days spent scouring unindexed PDFs, gazette archives, and outdated catalogs.',
      bisense: 'Sub-second semantic search matching technical requirements directly to active IS codes.',
    },
    {
      parameter: 'Obsolete Edition Detection',
      manual: 'High risk of citing withdrawn editions (e.g. citing IS 456:1978 or IS 1786:2008).',
      bisense: 'Real-time alert highlighting superseding editions, active amendments, and corrigenda.',
    },
    {
      parameter: 'Cross-Reference & Testing Codes',
      manual: 'Referenced test methods and raw material dependencies are routinely omitted in tenders.',
      bisense: 'Automated Knowledge Graph maps mandatory testing methods, sample sizes, and frequencies.',
    },
    {
      parameter: 'Quality Control Orders (QCOs)',
      manual: 'Line ministries release frequent mandatory QCOs; manual tracking leads to non-compliance.',
      bisense: 'Live regulatory feed flags mandatory certification schemes and penal provisions instantly.',
    },
    {
      parameter: 'Tender Clause Generation',
      manual: 'Fragmented manual drafting prone to audit objections, delays, and contractor disputes.',
      bisense: 'One-click generation of GeM-ready BoQ schedules with verifiable compliance clauses.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-800">
            Why BISense
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 mt-3 mb-4">
            The Difference Between Manual Search and Standards Intelligence
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Compare traditional procurement preparation against the BISense automated intelligence engine.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-900 text-white font-semibold text-xs md:text-sm py-4 px-6 border-b border-slate-800">
            <div className="md:col-span-4 uppercase tracking-wider text-slate-400">Dimension</div>
            <div className="md:col-span-4 text-slate-300">Manual / Legacy Method</div>
            <div className="md:col-span-4 text-orange-400 flex items-center gap-1.5">
              <span>BISense AI Platform</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono">Recommended</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {comparisons.map((row, idx) => (
              <div 
                key={idx} 
                className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4 md:gap-0 items-start hover:bg-slate-50/60 transition-colors"
              >
                <div className="md:col-span-4 font-bold text-sm text-slate-900 pr-4">
                  {row.parameter}
                </div>
                
                <div className="md:col-span-4 pr-6 flex items-start gap-2.5 text-xs md:text-sm text-slate-500">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{row.manual}</span>
                </div>

                <div className="md:col-span-4 flex items-start gap-2.5 text-xs md:text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{row.bisense}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table Bottom Callout */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 text-center sm:text-left">
              <strong>99.4% precision</strong> across 1,000+ audited technical specification clauses.
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore With Your Own Tender</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ComparisonSection;
