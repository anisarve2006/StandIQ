import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Layers, 
  CheckCircle2
} from 'lucide-react';
import { useGetSession } from '../../hooks/useProcurement';
import type { Requirement, RequirementCategory } from '../../types/api';

const DEFAULT_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    category: 'ELECTRICAL',
    name: 'Rated Output Power',
    normalized_value: 75,
    unit: 'kW',
    required: true,
    source_text: 'Motor power rating: 75 kW continuous duty'
  },
  {
    id: 'req-2',
    category: 'ELECTRICAL',
    name: 'Operating Voltage & Frequency',
    normalized_value: 415,
    unit: 'V, 50 Hz',
    required: true,
    source_text: 'Supply: 415V ±10%, 3-phase, 50 Hz ±5%'
  },
  {
    id: 'req-3',
    category: 'PERFORMANCE',
    name: 'Efficiency Level',
    normalized_value: 94.5,
    unit: '% (IE3)',
    required: true,
    source_text: 'Minimum efficiency 94.5% matching IE3 premium standard'
  },
  {
    id: 'req-4',
    category: 'TESTING',
    name: 'Efficiency Verification Method',
    expected_value: 'Loss Summation',
    unit: 'IS 8789',
    required: true,
    source_text: 'Loss summation test per IS 8789 / IEC 60034-2-1'
  },
  {
    id: 'req-5',
    category: 'PRODUCT',
    name: 'Enclosure Protection Rating',
    expected_value: 'IP55',
    unit: 'TEFC',
    required: true,
    source_text: 'Totally enclosed fan-cooled (TEFC) with IP55 ingress protection'
  },
  {
    id: 'req-6',
    category: 'SAFETY',
    name: 'Insulation & Temperature Rise',
    expected_value: 'Class F / Class B',
    unit: 'Insulation',
    required: true,
    source_text: 'Class F insulation with temperature rise limited to Class B limits'
  }
];

export default function RequirementUnderstandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data: sessionData } = useGetSession(sessionId);

  const initialReqs = (sessionData?.requirements && sessionData.requirements.length > 0)
    ? sessionData.requirements
    : DEFAULT_REQUIREMENTS;

  const [requirements, setRequirements] = useState<Requirement[]>(initialReqs);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New requirement draft
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<RequirementCategory>('ELECTRICAL');
  const [newValue, setNewValue] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRequired, setNewRequired] = useState(true);

  const categories = useMemo(() => {
    const cats = new Set(requirements.map(r => r.category));
    return ['ALL', ...Array.from(cats)];
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    if (activeCategory === 'ALL') return requirements;
    return requirements.filter(r => r.category === activeCategory);
  }, [requirements, activeCategory]);

  const handleRemove = (id: string | undefined) => {
    if (!id) return;
    setRequirements(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;
    setRequirements(prev => prev.map(r => r.id === editingReq.id ? editingReq : r));
    setEditingReq(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const numVal = parseFloat(newValue);
    const newReq: Requirement = {
      id: `req-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      normalized_value: !isNaN(numVal) ? numVal : undefined,
      expected_value: isNaN(numVal) ? newValue : undefined,
      unit: newUnit,
      required: newRequired,
      source_text: `${newName}: ${newValue} ${newUnit}`
    };

    setRequirements([...requirements, newReq]);
    setIsAddOpen(false);
    setNewName('');
    setNewValue('');
    setNewUnit('');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/procurements')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Procurements</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Structured Procurement Requirements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-extracted technical parameters and performance criteria verified for standards matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Requirement</span>
          </button>
          <button
            onClick={() => navigate('/standards')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs text-xs cursor-pointer"
          >
            <span>Match Standards</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 02. Summary Pill Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {sessionData?.title || 'Three-Phase Induction Motor 75kW Specification'}
            </h2>
            <p className="text-xs text-slate-500">
              {requirements.length} parameters extracted across {categories.length - 1} technical categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Requirements Validated</span>
          </span>
        </div>
      </div>

      {/* 03. Category Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-3 pt-1 px-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{cat}</span>
            <span className={`text-[10px] font-mono ml-1.5 px-1.5 py-0.2 rounded-full ${
              activeCategory === cat ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {cat === 'ALL' ? requirements.length : requirements.filter(r => r.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* 04. Requirements Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Parameter</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Value / Rating</th>
                <th className="py-3 px-5">Requirement Status</th>
                <th className="py-3 px-5">Source Context</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    {req.name}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {req.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-700">
                    {req.normalized_value !== undefined 
                      ? `${req.normalized_value} ${req.unit || ''}` 
                      : (req.expected_value ? `${req.expected_value} ${req.unit || ''}` : 'Specified')}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      req.required 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {req.required ? 'Mandatory' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 text-[11px] max-w-xs truncate">
                    {req.source_text}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingReq(req)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Edit Requirement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(req.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Edit Technical Requirement</h2>
              <button onClick={() => setEditingReq(null)} className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Parameter Name</label>
                <input
                  type="text"
                  value={editingReq.name}
                  onChange={(e) => setEditingReq({ ...editingReq, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={editingReq.normalized_value !== undefined ? editingReq.normalized_value.toString() : (editingReq.expected_value || '')}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        setEditingReq({ ...editingReq, normalized_value: num, expected_value: undefined });
                      } else {
                        setEditingReq({ ...editingReq, normalized_value: undefined, expected_value: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editingReq.unit || ''}
                    onChange={(e) => setEditingReq({ ...editingReq, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Add New Technical Requirement</h2>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddNew} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Parameter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ingress Protection (IP Rating)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RequirementCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="PERFORMANCE">PERFORMANCE</option>
                    <option value="TESTING">TESTING</option>
                    <option value="SAFETY">SAFETY</option>
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="INSTALLATION">INSTALLATION</option>
                    <option value="CERTIFICATION">CERTIFICATION</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Value & Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. IP55"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="mandatoryCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Mandatory Compliance Parameter
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Add Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
