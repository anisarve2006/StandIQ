import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, CheckCircle2, FileUp, Sparkles, Network, FileCheck } from 'lucide-react';
import BISenseLogo from './BISenseLogo';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Upload Specifications or Tender Documents",
      icon: FileUp,
      badge: "Ingestion & OCR",
      desc: "Drag and drop any RFP, tender BoQ, or technical specification PDF. BISense's multi-layered parser extracts material requirements, grade specifications, and referenced standard codes.",
      preview: "Extracted 14 item clauses • Identified 6 explicit IS references • Detected 3 unstandardized terms"
    },
    {
      title: "2. Neural Semantic Standard Matching",
      icon: Sparkles,
      badge: "BIS Database Engine",
      desc: "Our bilingual semantic model correlates material requirements against 21,000+ Bureau of Indian Standards codes, instantly identifying the governing Indian Standard (e.g. IS 1786 for TMT Rebars, IS 456 for Reinforced Concrete).",
      preview: "Matched IS 1786:2023 (Fe 500D) • Replaced obsolete 2008 edition • Flagged Amendment No. 3"
    },
    {
      title: "3. Interactive Knowledge Graph & QCO Verification",
      icon: Network,
      badge: "Cross-Reference Graph",
      desc: "BISense traverses the dynamic dependency tree to reveal secondary standards—such as mandatory sampling methods (IS 1608), aggregate tests (IS 383), and government Quality Control Orders (QCOs).",
      preview: "Resolved 5 linked testing codes • Verified BIS License requirement • Zero orphaned dependencies"
    },
    {
      title: "4. Generate GeM-Ready Compliant Specifications",
      icon: FileCheck,
      badge: "One-Click Export",
      desc: "Produce airtight tender specifications ready for GeM (Government e-Marketplace), complete with mandatory testing frequencies, inspection checklists, and legal compliance clauses.",
      preview: "Audit-ready PDF generated • 100% compliant with Central Vigilance Commission guidelines"
    }
  ];

  const handleLaunch = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2 mb-2">
          <BISenseLogo size="sm" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
            Interactive Product Architecture
          </span>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
          How BISense Automates Standards Intelligence
        </h3>
        <p className="text-sm text-slate-600 mt-1 mb-6">
          Step through the 4-phase neural pipeline transforming raw procurement text into verified compliance.
        </p>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-orange-50/80 border-orange-400 shadow-xs' 
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-bold ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                </div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                  {step.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Step Showcase Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              {steps[activeStep].badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Step {activeStep + 1} of 4
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-2">
            {steps[activeStep].title}
          </h4>

          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {steps[activeStep].desc}
          </p>

          <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs text-slate-700 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{steps[activeStep].preview}</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 3))}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Previous Step
          </button>

          <div className="flex items-center gap-3">
            {activeStep < 3 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={handleLaunch}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Try with Real Tender</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
