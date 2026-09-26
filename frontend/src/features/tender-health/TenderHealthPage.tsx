import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Check, 
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

export default function TenderHealthPage() {
  const navigate = useNavigate();
  const { addToBasket, isInBasket, basket } = useStandIQ();

  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddClause = (id: string, name?: string) => {
    setAddedItems(prev => [...prev, id]);

    if (id === 'iss-1' || id === 'sug-2') {
      addToBasket({
        id: 'BIS CRS Certification',
        code: 'BIS CRS',
        title: 'Compulsory Registration Scheme for Induction Motors',
        type: 'Product',
        status: 'Current',
        mandatory: true
      });
      showToast('Added BIS CRS Certification Requirement to Basket');
    } else if (id === 'iss-2' || id === 'sug-3') {
      addToBasket({
        id: 'IS 8789:1981',
        code: 'IS 8789:1981',
        title: 'Method of Test for Efficiency of Induction Motors',
        type: 'Testing',
        status: 'Current',
        year: 1981,
        reaffirmedYear: 2021
      });
      showToast('Added IS 8789:1981 Testing Standard to Basket');
    } else if (id === 'iss-3' || id === 'sug-4') {
      addToBasket({
        id: 'IS 9383:1997',
        code: 'IS 9383:1997',
        title: 'Installation of Electrical Equipment in Hazardous Areas',
        type: 'Installation',
        status: 'Current',
        year: 1997,
        reaffirmedYear: 2020
      });
      showToast('Added IS 9383:1997 Installation Standard to Basket');
    } else if (id === 'sug-1') {
      addToBasket({
        id: 'IS 12615:2018',
        code: 'IS 12615:2018',
        title: 'Energy Efficient Induction Motors (Three-phase)',
        type: 'Product',
        status: 'Current',
        year: 2018,
        reaffirmedYear: 2023,
        mandatory: true
      });
      showToast('Added IS 12615:2018 Mandatory Standard to Basket');
    } else {
      showToast(`Added ${name || 'Clause'} to Standards Basket`);
    }
  };

  const isAdded = (id: string) => {
    if (addedItems.includes(id)) return true;
    if (id === 'sug-1' && isInBasket('IS 12615:2018')) return true;
    if ((id === 'iss-2' || id === 'sug-3') && isInBasket('IS 8789:1981')) return true;
    if ((id === 'iss-3' || id === 'sug-4') && isInBasket('IS 9383:1997')) return true;
    if ((id === 'iss-1' || id === 'sug-2') && isInBasket('BIS CRS')) return true;
    return false;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <ShoppingBag className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => navigate('/basket')}
            className="ml-2 font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            View Basket ({basket.length})
          </button>
        </div>
      )}

      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tender Health Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered analysis of tender specifications against applicable standards
          </p>
        </div>

        <button
          onClick={() => navigate('/review')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Analyze New Tender</span>
        </button>
      </div>

      {/* 02. Top Row: Overall Score & Category-wise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Overall Health Score Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Overall Health Score</h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Low Compliance Risk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-4">
            {/* Circular Gauge 78% */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.78)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">78%</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Health Score</span>
                </div>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="sm:col-span-7 space-y-3">
              {[
                { label: 'Standards Coverage', value: 96, color: 'bg-emerald-500' },
                { label: 'Technical Completeness', value: 76, color: 'bg-blue-600' },
                { label: 'Compliance Readiness', value: 80, color: 'bg-indigo-600' },
                { label: 'Risk Factors', value: 25, color: 'bg-amber-500' },
              ].map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{m.label}</span>
                    <span className="font-mono font-bold text-slate-900">{m.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${m.color}`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tender: Electrical_Distribution_Panel_2026.pdf</span>
            <button
              onClick={() => navigate('/standards/IS 12615:2018')}
              className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Target Standard: IS 12615:2018</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Category-wise Analysis */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Category-wise Analysis</h2>
            <span className="text-xs text-slate-400">6 core domains</span>
          </div>

          <div className="space-y-3.5 my-4">
            {[
              { label: 'Electrical Specifications', value: 90, color: 'bg-blue-600' },
              { label: 'Testing Requirements', value: 75, color: 'bg-indigo-600' },
              { label: 'Safety Requirements', value: 60, color: 'bg-amber-500' },
              { label: 'Certification Requirements', value: 40, color: 'bg-rose-500' },
              { label: 'Installation Requirements', value: 80, color: 'bg-blue-500' },
              { label: 'Documentation', value: 95, color: 'bg-emerald-500' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{cat.label}</span>
                  <span className="font-mono font-bold text-slate-900">{cat.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Certification Requirements is below the recommended 70% threshold.</span>
          </div>
        </div>
      </div>

      {/* 03. Bottom Row: Issues & Recommendations vs AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Issues & Recommendations */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Issues & Recommendations</h2>
            <p className="text-xs text-slate-400">Identified clauses requiring remediation</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Issue 1 */}
            <div className="p-4.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-800">Missing certification requirement for BIS CRS</span>
                </div>
                <p className="text-slate-500 text-[11px] pl-4">Clause 6.2 lacks mandatory Compulsory Registration Scheme reference.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  High
                </span>
                <button
                  onClick={() => handleAddClause('iss-1', 'BIS CRS')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isAdded('iss-1')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  }`}
                >
                  {isAdded('iss-1') ? 'In Basket' : 'Add to Basket'}
                </button>
              </div>
            </div>

            {/* Issue 2 */}
            <div className="p-4.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">Incomplete testing parameters for efficiency</span>
                </div>
                <p className="text-slate-500 text-[11px] pl-4">Missing reference to IS 8789 method of test procedures.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Medium
                </span>
                <button
                  onClick={() => handleAddClause('iss-2', 'Testing params (IS 8789)')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isAdded('iss-2')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  }`}
                >
                  {isAdded('iss-2') ? 'In Basket' : 'Add to Basket'}
                </button>
              </div>
            </div>

            {/* Issue 3 */}
            <div className="p-4.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">Consider adding installation standard reference</span>
                </div>
                <p className="text-slate-500 text-[11px] pl-4">IS 9383:1997 code of practice for hazardous installation.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Medium
                </span>
                <button
                  onClick={() => handleAddClause('iss-3', 'Installation ref (IS 9383)')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isAdded('iss-3')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  }`}
                >
                  {isAdded('iss-3') ? 'In Basket' : 'Add to Basket'}
                </button>
              </div>
            </div>

            {/* Issue 4 - Good alignment */}
            <div className="p-4.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Specifications align well with IS 12615:2018</span>
                </div>
                <p className="text-slate-500 text-[11px] pl-4">Energy efficiency metrics comply with IE3 requirements.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Good
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Suggestions */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Suggestions</h2>
              <p className="text-xs text-slate-400">One-click standard recommendations</p>
            </div>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { id: 'sug-1', title: 'Add IS 12615:2018', desc: 'Mandatory standard for high efficiency induction motors' },
              { id: 'sug-2', title: 'Add certification clause', desc: 'Requires bidder to provide valid BIS CRS certification license' },
              { id: 'sug-3', title: 'Include testing standards', desc: 'Bind testing to IS 8789:1981 efficiency measurement' },
              { id: 'sug-4', title: 'Add installation requirements', desc: 'Include IS 9383:1997 electrical equipment installation protocols' },
            ].map((sug) => (
              <div
                key={sug.id}
                className="p-4.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-bold text-slate-900">{sug.title}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] pl-4">{sug.desc}</p>
                </div>

                <button
                  onClick={() => handleAddClause(sug.id, sug.title)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isAdded(sug.id)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {isAdded(sug.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>In Basket</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add to Basket</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Ready to build compliant tender specification?</span>
            <button
              onClick={() => navigate('/specification-builder')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Build Specification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
