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
  const { addToBasket, isInBasket, basket, activeDocument } = useStandIQ();

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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-800">
          <ShoppingBag className="w-4 h-4 text-slate-300" />
          <span>{toastMessage}</span>
          <button
            onClick={() => navigate('/basket')}
            className="ml-2 font-medium text-slate-200 hover:text-white underline cursor-pointer whitespace-nowrap"
          >
            View Basket ({basket.length})
          </button>
        </div>
      )}

      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tender Health Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specification compliance and gap detection against Indian Standards
          </p>
        </div>

        <button
          onClick={() => navigate('/review')}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors active:scale-[0.98] text-xs cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Analyze New Tender</span>
        </button>
      </div>

      {/* Active Document Indicator - Minimalist Card */}
      {activeDocument && (
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Target Procurement</span>
            <span className="font-semibold text-slate-900 text-sm">{activeDocument.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap">
              Compliance: {activeDocument.auditSummary?.complianceScore ?? 78}%
            </span>
            <span className="font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap">
              Basket: {basket.length} standards
            </span>
          </div>
        </div>
      )}

      {/* 02. Top Row: Overall Score & Category-wise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Overall Health Score Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Health Score</h2>
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Low Risk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-2">
            {/* Minimalist Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.78)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">78%</span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Score</span>
                </div>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="sm:col-span-7 space-y-2.5">
              {[
                { label: 'Standards Coverage', value: 96 },
                { label: 'Technical Completeness', value: 76 },
                { label: 'Compliance Readiness', value: 80 },
                { label: 'Risk Factor', value: 25 },
              ].map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{m.label}</span>
                    <span className="font-mono font-medium text-slate-900">{m.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-slate-700"
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Doc: {activeDocument?.fileName || 'Distribution_Panel_2026.pdf'}</span>
            <button
              onClick={() => navigate('/standards/IS 12615:2018')}
              className="text-slate-700 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer font-sans text-xs"
            >
              <span>Target Standard: IS 12615:2018</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right: Category-wise Analysis */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Category Analysis</h2>
            <span className="text-xs text-slate-400 font-mono">6 evaluation points</span>
          </div>

          <div className="space-y-2.5 py-1">
            {[
              { label: 'Electrical Specifications', value: 90 },
              { label: 'Testing Requirements', value: 75 },
              { label: 'Safety Requirements', value: 60 },
              { label: 'Certification Requirements', value: 40 },
              { label: 'Installation Requirements', value: 80 },
              { label: 'Documentation', value: 95 },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{cat.label}</span>
                  <span className="font-mono font-medium text-slate-900">{cat.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-slate-700 transition-all duration-300"
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Certification Requirements is below the recommended 70% threshold.</span>
          </div>
        </div>
      </div>

      {/* 03. Bottom Row: Issues & Recommendations vs AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Issues & Recommendations */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Issues & Remediation</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Clauses flagged for standards alignment</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Issue 1 */}
            <div className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Missing certification requirement for BIS CRS</span>
                </div>
                <p className="text-slate-500 text-[11px]">Clause 6.2 lacks mandatory Compulsory Registration Scheme reference.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 whitespace-nowrap shrink-0">
                  Priority 1
                </span>
                <button
                  onClick={() => handleAddClause('iss-1', 'BIS CRS')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isAdded('iss-1')
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'border border-slate-300 hover:border-slate-400 bg-white text-slate-800'
                  }`}
                >
                  {isAdded('iss-1') ? 'In Basket' : '+ Basket'}
                </button>
              </div>
            </div>

            {/* Issue 2 */}
            <div className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Incomplete testing parameters for efficiency</span>
                </div>
                <p className="text-slate-500 text-[11px]">Missing reference to IS 8789 method of test procedures.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 whitespace-nowrap shrink-0">
                  Priority 2
                </span>
                <button
                  onClick={() => handleAddClause('iss-2', 'Testing params (IS 8789)')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isAdded('iss-2')
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'border border-slate-300 hover:border-slate-400 bg-white text-slate-800'
                  }`}
                >
                  {isAdded('iss-2') ? 'In Basket' : '+ Basket'}
                </button>
              </div>
            </div>

            {/* Issue 3 */}
            <div className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Consider adding installation standard reference</span>
                </div>
                <p className="text-slate-500 text-[11px]">IS 9383:1997 code of practice for hazardous installation.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 whitespace-nowrap shrink-0">
                  Priority 3
                </span>
                <button
                  onClick={() => handleAddClause('iss-3', 'Installation ref (IS 9383)')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isAdded('iss-3')
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'border border-slate-300 hover:border-slate-400 bg-white text-slate-800'
                  }`}
                >
                  {isAdded('iss-3') ? 'In Basket' : '+ Basket'}
                </button>
              </div>
            </div>

            {/* Issue 4 - Good alignment */}
            <div className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Specifications align well with IS 12615:2018</span>
                </div>
                <p className="text-slate-500 text-[11px]">Energy efficiency metrics comply with IE3 requirements.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 whitespace-nowrap shrink-0">
                  Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Suggestions */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recommended Standards</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct add to active procurement basket</p>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
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
                className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{sug.title}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{sug.desc}</p>
                </div>

                <button
                  onClick={() => handleAddClause(sug.id, sug.title)}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isAdded(sug.id)
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'border border-slate-300 hover:border-slate-400 bg-white text-slate-800'
                  }`}
                >
                  {isAdded(sug.id) ? (
                    <>
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>In Basket</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Ready to build compliant tender specification?</span>
            <button
              onClick={() => navigate('/specification-builder')}
              className="font-medium text-slate-800 hover:text-slate-900 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
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
