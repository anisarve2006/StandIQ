import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  GripVertical, 
  X, 
  Eye, 
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Download,
  FileCheck
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { exportDocumentToPdf } from '../../services/pdfExport';

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
  const { basket, removeFromBasket, activeDocument } = useStandIQ();

  const [sections, setSections] = useState<SpecSection[]>(DEFAULT_SECTIONS);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (id: number) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const removeSection = (id: number) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setSections(copy);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec: SpecSection = {
      id: Date.now(),
      title: newSectionTitle.trim(),
      description: 'Custom tender clause specified by procurement officer',
      enabled: true,
    };
    setSections(prev => [...prev, newSec]);
    setNewSectionTitle('');
    setShowAddSection(false);
    showToast(`Added custom section "${newSec.title}"`);
  };

  const handleCopyOutline = async () => {
    const lines = [
      `TENDER SPECIFICATION OUTLINE`,
      `Document: ${activeDocument?.title || 'Standard Tender Specification'}`,
      `Standards Incorporated (${basket.length}): ${basket.map(s => s.code).join(', ')}`,
      ``,
      `SECTIONS:`,
      ...sections.filter(s => s.enabled).map((s, idx) => `${idx + 1}. ${s.title} — ${s.description}`)
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    showToast('Specification outline copied to clipboard!');
  };

  const handleGenerateAndExport = () => {
    if (activeDocument) {
      exportDocumentToPdf(activeDocument, basket);
      showToast(`Generating specification PDF report for ${activeDocument.title.slice(0, 30)}...`);
    } else {
      showToast('Generated Tender Specification! Proceeding to approval queue...');
    }
    setTimeout(() => {
      navigate('/approval');
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tender Specification Builder</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assemble, configure and export compliant tender specifications with applicable Indian Standards.
          </p>
        </div>

        {activeDocument && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-amber-800">Active Document:</span>
            <span className="font-mono font-bold text-slate-900 truncate max-w-xs">{activeDocument.title}</span>
          </div>
        )}
      </div>

      {/* 02. Process Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
          {[
            { num: 1, label: 'Select Standards', completed: true },
            { num: 2, label: 'Configure Clauses', active: true },
            { num: 3, label: 'Generate Draft', completed: false },
            { num: 4, label: 'Approval Queue', completed: false },
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
        {/* Left Column: Selected Standards (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Selected Standards ({basket.length})
              </h2>
              <p className="text-[11px] text-slate-400">Incorporated into final draft</p>
            </div>
            <button
              onClick={() => navigate('/basket')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Edit Basket
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {basket.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No standards in basket.
                <button
                  onClick={() => navigate('/standards')}
                  className="block mx-auto mt-2 text-blue-600 font-semibold underline cursor-pointer"
                >
                  Browse standards catalog
                </button>
              </div>
            ) : (
              basket.map((std) => (
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
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0 cursor-pointer"
                    title="Remove standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/standards')}
              className="w-full py-2 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Standards</span>
            </button>
          </div>
        </div>

        {/* Right Column: Specification Structure (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Specification Structure & Clauses</h2>
              <p className="text-xs text-slate-400">Reorder, enable, or insert custom tender clauses</p>
            </div>
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Clause</span>
            </button>
          </div>

          {/* New Section Input */}
          {showAddSection && (
            <div className="p-4 bg-amber-50/60 border-b border-amber-200/80 flex items-center gap-2 animate-in fade-in">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Enter new tender clause title (e.g. Environmental Impact & Disposal Requirements)..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
              />
              <button
                onClick={handleAddSection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
              >
                Insert
              </button>
              <button
                onClick={() => setShowAddSection(false)}
                className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-4 space-y-2.5">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors shadow-2xs ${
                  sec.enabled ? 'border-slate-200/80 bg-white hover:border-slate-300' : 'border-slate-200/40 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{sec.title}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{sec.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer rounded hover:bg-slate-100"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer rounded hover:bg-slate-100"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="checkbox"
                    checked={sec.enabled}
                    onChange={() => toggleSection(sec.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer ml-1"
                    title="Toggle active in specification"
                  />
                  <button
                    onClick={() => removeSection(sec.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                    title="Delete section"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPreviewModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview Outline</span>
              </button>
              <button
                onClick={handleCopyOutline}
                className="w-full sm:w-auto px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Outline</span>
              </button>
            </div>

            <button
              onClick={handleGenerateAndExport}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Generate & Export Spec</span>
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
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-sm">Specification Draft Outline</h2>
              </div>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 max-h-[440px] overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-amber-900">
                <span className="font-bold">Active Tender:</span> {activeDocument?.title || 'Standard Technical Procurement'}
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <span className="font-bold">Standard References ({basket.length}):</span>{' '}
                {basket.length > 0 ? basket.map(s => s.code).join(', ') : 'No standards linked'}
              </div>
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Included Specification Clauses:</span>
                <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                  {sections.filter(s => s.enabled).map(s => (
                    <li key={s.id}>
                      <span className="font-semibold text-slate-900">{s.title}</span>
                      <p className="text-[11px] text-slate-500 font-normal">{s.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleCopyOutline}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
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
