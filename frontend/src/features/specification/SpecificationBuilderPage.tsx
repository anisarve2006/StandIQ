import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  GripVertical, 
  X, 
  Eye, 
  ChevronRight
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface SpecSection {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_SECTIONS: SpecSection[] = [
  { id: 1, title: 'General Requirements', description: 'Procurement scope, environmental operating limits, site conditions', enabled: true },
  { id: 2, title: 'Technical Specifications', description: 'Motor rating, frame sizes, insulation class, torque characteristics', enabled: true },
  { id: 3, title: 'Efficiency Requirements', description: 'IE3 premium efficiency band conforming to IS 12615', enabled: true },
  { id: 4, title: 'Safety Requirements', description: 'Enclosure IP55 rating, grounding standards, dielectric clearance', enabled: true },
  { id: 5, title: 'Testing & Inspection', description: 'Loss summation, temperature rise, routine and type test certificates', enabled: true },
  { id: 6, title: 'Installation Requirements', description: 'Foundation bolting, vibration limits, alignment tolerances', enabled: true },
  { id: 7, title: 'Certification Requirements', description: 'Mandatory BIS ISI mark license, CRS registration schedule', enabled: true },
  { id: 8, title: 'Documentation', description: 'Operation manuals, test reports, spare parts schedule, warranty', enabled: true },
];

export default function SpecificationBuilderPage() {
  const navigate = useNavigate();
  const { basket, removeFromBasket } = useStandIQ();

  const [sections, setSections] = useState<SpecSection[]>(DEFAULT_SECTIONS);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const toggleSection = (id: number) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const removeSection = (id: number) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tender Specification Builder</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Assemble and configure compliant tender specifications with applicable Indian Standards.
        </p>
      </div>

      {/* 02. Process Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
          {[
            { num: 1, label: 'Select', completed: true },
            { num: 2, label: 'Configure', active: true },
            { num: 3, label: 'Generate', completed: false },
            { num: 4, label: 'Review', completed: false },
          ].map((step, idx) => (
            <div key={step.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step.completed
                    ? 'bg-emerald-500 text-white'
                    : step.active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.completed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.num}
              </div>
              <span className={step.active ? 'text-blue-600 font-bold' : step.completed ? 'text-slate-800' : 'text-slate-400'}>
                {step.label}
              </span>
              {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-300 ml-4 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* 03. 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Selected Standards (5) (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Selected Standards ({basket.length})
            </h2>
            <button
              onClick={() => navigate('/basket')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Edit Basket
            </button>
          </div>

          <div className="space-y-2">
            {basket.map((std) => (
              <div
                key={std.code}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-200 transition-colors group"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-mono text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                    {std.code}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {std.title}
                  </span>
                </div>
                <button
                  onClick={() => removeFromBasket(std.code)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                  title="Remove standard"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/standards')}
              className="w-full py-2 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>+ Add More Standards</span>
            </button>
          </div>
        </div>

        {/* Right Column: Specification Structure (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Specification Structure</h2>
              <p className="text-xs text-slate-400">Reorder and customize standard tender specification sections</p>
            </div>
            <span className="text-xs font-mono text-slate-400">8 sections defined</span>
          </div>

          <div className="p-4 space-y-2.5">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" />
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{sec.title}</h3>
                    <p className="text-[11px] text-slate-500">{sec.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sec.enabled}
                    onChange={() => toggleSection(sec.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={() => removeSection(sec.id)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview Outline</span>
            </button>

            <button
              onClick={() => navigate('/approval')}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Generate Specification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Outline Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Specification Draft Outline</h2>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <span className="font-bold">Standard Reference:</span> IS 12615:2018 + 4 Allied Standards incorporated.
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                {sections.filter(s => s.enabled).map(s => (
                  <li key={s.id} className="font-semibold">{s.title}</li>
                ))}
              </ol>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
