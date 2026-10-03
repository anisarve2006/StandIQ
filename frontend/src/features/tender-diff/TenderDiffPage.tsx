import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitCompare, 
  Plus, 
  Minus, 
  FileText, 
  CheckCircle2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface DiffFinding {
  type: 'added' | 'removed' | 'modified';
  clause: string;
  originalText?: string;
  updatedText?: string;
  standardRef?: string;
}

export default function TenderDiffPage() {
  const navigate = useNavigate();
  const { activeDocument } = useStandIQ();

  const [versionA, setVersionA] = useState(activeDocument?.rawTextContent || '');
  const [versionB, setVersionB] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [diffResults, setDiffResults] = useState<DiffFinding[] | null>(null);

  const handleCompare = () => {
    setIsComparing(true);
    setTimeout(() => {
      setIsComparing(false);
      // Generate parsed diff
      const findings: DiffFinding[] = [];
      const linesA = versionA.split('\n').filter(l => l.trim());
      const linesB = versionB.split('\n').filter(l => l.trim());

      linesB.forEach((lineB) => {
        const clauseMatch = lineB.match(/^(4\.\d+|Clause \d+)/i);
        const prefix = clauseMatch ? clauseMatch[0] : '';
        const matchingA = linesA.find(l => prefix && l.includes(prefix));

        if (matchingA) {
          if (matchingA !== lineB) {
            findings.push({
              type: 'modified',
              clause: prefix ? `Clause ${prefix}` : 'Modified Requirement',
              originalText: matchingA,
              updatedText: lineB,
              standardRef: lineB.includes('IS ') ? lineB.match(/IS \d+[:\d]*/)?.[0] : undefined
            });
          }
        } else {
          findings.push({
            type: 'added',
            clause: prefix ? `Clause ${prefix}` : 'New Clause Added',
            updatedText: lineB,
            standardRef: lineB.includes('IS ') ? lineB.match(/IS \d+[:\d]*/)?.[0] : undefined
          });
        }
      });

      linesA.forEach((lineA) => {
        const clauseMatch = lineA.match(/^(4\.\d+|Clause \d+)/i);
        const prefix = clauseMatch ? clauseMatch[0] : '';
        if (prefix && !linesB.some(l => l.includes(prefix))) {
          findings.push({
            type: 'removed',
            clause: `Clause ${prefix}`,
            originalText: lineA
          });
        }
      });

      setDiffResults(findings);
    }, 600);
  };

  const addedCount = diffResults?.filter(d => d.type === 'added').length || 0;
  const modifiedCount = diffResults?.filter(d => d.type === 'modified').length || 0;
  const removedCount = diffResults?.filter(d => d.type === 'removed').length || 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/tender-health')}
            className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1.5 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tender Health</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Specification Comparison & Diff</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare original draft tender specification against AI-recommended Indian Standards revision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVersionA('');
              setVersionB('');
              setDiffResults(null);
            }}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
          <button
            onClick={() => navigate('/specification-builder')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2"
          >
            <span>Proceed to Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 02. Metrics Bar */}
      {diffResults && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Changes</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {(addedCount + modifiedCount + removedCount).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Added Clauses</span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 block">
              +{addedCount.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Standardized</span>
            <span className="text-2xl font-extrabold text-orange-600 font-mono mt-1 block">
              {modifiedCount.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">Removed Clauses</span>
            <span className="text-2xl font-extrabold text-rose-500 font-mono mt-1 block">
              -{removedCount.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* 03. Side-by-Side Textarea Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Version A (Original Tender Draft)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Non-standardized</span>
          </div>
          <textarea
            rows={7}
            value={versionA}
            onChange={(e) => setVersionA(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Version B (BIS Compliant Tender)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 font-bold">Standardized</span>
          </div>
          <textarea
            rows={7}
            value={versionB}
            onChange={(e) => setVersionB(e.target.value)}
            className="w-full p-3 bg-orange-50/20 border border-orange-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={isComparing || !versionA || !versionB}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          {isComparing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Differences...</span>
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              <span>Compare Versions</span>
            </>
          )}
        </button>
      </div>

      {/* 04. Diff Results Stream */}
      {diffResults && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Clause-by-Clause Remediation Results</h3>
            <span className="text-xs text-slate-400 font-mono">{diffResults.length} clauses analyzed</span>
          </div>

          <div className="divide-y divide-slate-100 p-2 space-y-1">
            {diffResults.map((finding, idx) => (
              <div key={idx} className="p-4 rounded-lg hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      finding.type === 'added'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : finding.type === 'modified'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {finding.type.toUpperCase()}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{finding.clause}</h4>
                  </div>

                  {finding.standardRef && (
                    <span className="font-mono text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                      Target: {finding.standardRef}
                    </span>
                  )}
                </div>

                {finding.originalText && (
                  <div className="flex items-start gap-2 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100 text-xs text-rose-900">
                    <Minus className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-through opacity-80">{finding.originalText}</span>
                  </div>
                )}

                {finding.updatedText && (
                  <div className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 text-xs text-emerald-950 font-medium">
                    <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{finding.updatedText}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!diffResults && !isComparing && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <GitCompare className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Comparison Run Yet</h3>
          <p className="text-xs text-slate-500">
            Paste original tender clauses into Version A and the revised specification into Version B, then click &quot;Compare Versions&quot; to review differences.
          </p>
        </div>
      )}
    </div>
  );
}
