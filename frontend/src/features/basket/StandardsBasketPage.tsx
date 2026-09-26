import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ArrowRight
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

export default function StandardsBasketPage() {
  const navigate = useNavigate();
  const { basket, removeFromBasket, clearBasket } = useStandIQ();
  const [selectedIds, setSelectedIds] = useState<string[]>(basket.map(s => s.code));

  const toggleSelect = (code: string) => {
    setSelectedIds(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === basket.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(basket.map(s => s.code));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Standards Basket</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage selected standards for your procurement specification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/standards')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Standard</span>
          </button>
        </div>
      </div>

      {/* 02. Basket Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={basket.length > 0 && selectedIds.length === basket.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                </th>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-5">Standard</th>
                <th className="py-3 px-5">Title</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {basket.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Your basket is empty. Browse standards to add them to your procurement specification.
                  </td>
                </tr>
              ) : (
                basket.map((s, idx) => (
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
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                      {s.code}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700 max-w-md">
                      {s.title}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => removeFromBasket(s.code)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove standard"
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
              <strong className="text-slate-900">{selectedIds.length}</strong> of {basket.length} standards selected
            </span>
            {basket.length > 0 && (
              <button
                onClick={clearBasket}
                className="text-slate-500 hover:text-rose-600 font-medium underline underline-offset-2 ml-2"
              >
                Clear All
              </button>
            )}
          </div>

          <button
            onClick={() => navigate('/specification-builder')}
            disabled={basket.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <span>Proceed to Specification Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
