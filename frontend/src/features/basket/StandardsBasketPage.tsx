import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ArrowRight,
  FileText,
  Copy,
  Download,
  Check,
  FolderOpen,
  Layers,
  ExternalLink,
  X
} from 'lucide-react';
import { useStandIQ, type BasketStandard } from '../../stores/standiq.store';
import { exportDocumentToPdf } from '../../services/pdfExport';

export default function StandardsBasketPage() {
  const navigate = useNavigate();
  const { 
    documents, 
    activeDocId, 
    activeDocument, 
    setActiveDocId, 
    getDocumentBasket, 
    addToDocumentBasket, 
    removeFromDocumentBasket, 
    clearDocumentBasket 
  } = useStandIQ();

  // Current document's basket
  const currentBasket = getDocumentBasket(activeDocId);
  const [selectedIds, setSelectedIds] = useState<string[]>(currentBasket.map(s => s.code));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<BasketStandard['type']>('Product');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSelect = (code: string) => {
    setSelectedIds(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentBasket.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentBasket.map(s => s.code));
    }
  };

  const handleCopyBasket = async () => {
    if (currentBasket.length === 0) return;
    let text = `=== STANDARDS BASKET: ${activeDocument.title} ===\n`;
    text += `Tender Ref: ${activeDocument.tenderNumber || activeDocument.fileName}\n`;
    text += `Total Standards: ${currentBasket.length}\n\n`;
    currentBasket.forEach((s, i) => {
      text += `${i + 1}. [${s.code}] ${s.title} (${s.type} - ${s.status})\n`;
    });
    await navigator.clipboard.writeText(text);
    showToast(`Copied ${currentBasket.length} standards from this document basket!`);
  };

  const handleExportPdf = () => {
    try {
      exportDocumentToPdf(activeDocument, currentBasket);
      showToast('Document Standards Basket PDF downloaded!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    const std: BasketStandard = {
      id: newCode.trim(),
      code: newCode.trim(),
      title: newTitle.trim() || `Indian Standard Specification (${newCode.trim()})`,
      type: newType,
      status: 'Current',
      mandatory: false
    };
    addToDocumentBasket(activeDocId, std);
    setNewCode('');
    setNewTitle('');
    setIsAddModalOpen(false);
    showToast(`Added ${std.code} to ${activeDocument.title}'s basket!`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Standards Basket</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>Multi-Document Baskets Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage separate, tailored standards baskets for each uploaded or analyzed procurement document.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopyBasket}
            disabled={currentBasket.length === 0}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            title="Copy all standards in this basket to clipboard"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>Copy Basket</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={currentBasket.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            title="Convert and export this document's standards basket to PDF"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Convert to PDF</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Standard</span>
          </button>
        </div>
      </div>

      {/* 02. Document Basket Selector (Tabs for each uploaded document) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>Select Document Basket</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Each document maintains an isolated basket of Indian Standards
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {documents.map((doc) => {
            const isSelected = doc.id === activeDocId;
            const docBasket = getDocumentBasket(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDocId(doc.id);
                  setSelectedIds(docBasket.map(s => s.code));
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-2.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="max-w-[170px] truncate leading-tight">{doc.title}</div>
                  <div className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {doc.category || 'Procurement'}
                  </div>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-white text-blue-700'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {docBasket.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 03. Active Document Metadata Banner */}
      <div className="bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-orange-50/30 border border-amber-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-mono text-sm shrink-0">
            {currentBasket.length}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{activeDocument.title}</div>
            <div className="text-slate-500 font-mono text-[11px] mt-0.5">
              Tender Ref: {activeDocument.tenderNumber || activeDocument.fileName} • {activeDocument.department}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/review', { state: { selectedDocId: activeDocId } })}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline underline-offset-2 whitespace-nowrap"
          >
            <span>Review Source Document</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 04. Basket Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={currentBasket.length > 0 && selectedIds.length === currentBasket.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                </th>
                <th className="py-3 px-3 w-10 text-center whitespace-nowrap">#</th>
                <th className="py-3 px-5 whitespace-nowrap">Standard Code</th>
                <th className="py-3 px-5 whitespace-nowrap">Title</th>
                <th className="py-3 px-5 whitespace-nowrap">Classification</th>
                <th className="py-3 px-5 whitespace-nowrap">Status</th>
                <th className="py-3 px-5 whitespace-nowrap">QCO Mandate</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentBasket.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    This document basket is currently empty. Browse standards catalog or use AI Review to add requirements.
                  </td>
                </tr>
              ) : (
                currentBasket.map((s, idx) => (
                  <tr
                    key={s.code}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.code)}
                        onChange={() => toggleSelect(s.code)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400 whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 group-hover:text-blue-600 whitespace-nowrap">
                      {s.code}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700 max-w-md">
                      {s.title}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {s.mandatory ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                          MANDATORY (ISI)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">Voluntary</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => removeFromDocumentBasket(activeDocId, s.code)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove standard from this document's basket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              <strong className="text-slate-900">{selectedIds.length}</strong> of {currentBasket.length} standards selected in this basket
            </span>
            {currentBasket.length > 0 && (
              <button
                onClick={() => clearDocumentBasket(activeDocId)}
                className="text-slate-500 hover:text-rose-600 font-medium underline underline-offset-2 ml-2 cursor-pointer"
              >
                Clear This Basket
              </button>
            )}
          </div>

          <button
            onClick={() => navigate('/specification-builder')}
            disabled={currentBasket.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Proceed to Specification Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Standard Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add Standard to Basket</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Target Basket: <strong className="text-slate-800">{activeDocument.title}</strong>
            </p>

            <form onSubmit={handleAddCustomStandard} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Code *</label>
                <input
                  type="text"
                  placeholder="e.g. IS 456:2000 or IS/IEC 61439-1"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Plain and Reinforced Concrete - Code of Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classification Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Product">Product Standard</option>
                  <option value="Testing">Testing Standard</option>
                  <option value="Safety">Safety Standard</option>
                  <option value="Installation">Installation Standard</option>
                  <option value="Terminology">Terminology</option>
                  <option value="Code of Practice">Code of Practice</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Add to This Basket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
