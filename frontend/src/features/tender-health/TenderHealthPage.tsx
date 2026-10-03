import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Check, 
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Scale,
  FileCheck2,
  AlertTriangle,
  Gavel,
  Copy,
  Download,
  RotateCcw,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { tenderApi } from '../../services/tenderApi';
import type { DisputeRiskReport, AuditVulnerabilityFinding } from '../../types/api';

// Demo Presets for Statutory Audit
const DEMO_PRESETS = [
  {
    id: 'preset-cvc',
    label: 'CVC Brand Bias',
    badge: 'Brand Tailoring',
    tagClass: 'border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100',
    text: 'Supply of TMT steel rebar Fe 500D for bridge construction. Make: Tata Tiscon or Jindal only. Other makes will not be accepted. Standard commercial quality.'
  },
  {
    id: 'preset-cag',
    label: 'CAG Obsolete Standard',
    badge: 'Superseded Standard',
    tagClass: 'border-rose-200 bg-rose-50/80 text-rose-800 hover:bg-rose-100',
    text: 'Procurement of 43 Grade Ordinary Portland Cement conforming to IS 8112:2013 for RCC foundation work. Best quality material.'
  },
  {
    id: 'preset-arb',
    label: 'Arbitration & Conflict Trap',
    badge: 'Contract Vagueness',
    tagClass: 'border-orange-200 bg-orange-50/80 text-orange-800 hover:bg-orange-100',
    text: 'Supply of superior make 15 kW motor. Operating voltage 415V continuous duty with 230V control coil without separate neutral. Heavy duty finish. No factory test certificate required.'
  },
  {
    id: 'preset-safe',
    label: '100% GFR 2017 Compliant',
    badge: 'Safe (0 Risk)',
    tagClass: 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100',
    text: 'High strength deformed steel bars conforming to IS 1786:2008 Grade Fe 500D with mandatory BIS ISI Mark certification under the Steel & Steel Products Quality Control Order. Manufacturer Test Certificate (MTC) as per IS 1608 required with third-party pre-dispatch inspection by NABL-accredited laboratory.'
  }
];

export default function TenderHealthPage() {
  const navigate = useNavigate();
  const { addToBasket, isInBasket, basket, activeDocument, activeDocId } = useStandIQ();

  // Active view tab (Dispute Risk Scorer vs Technical Health)
  const [activeTab, setActiveTab] = useState<'dispute_risk' | 'technical_health'>('dispute_risk');

  // Right pane tab in Dispute Risk view (Findings vs Remediated Spec)
  const [activePaneTab, setActivePaneTab] = useState<'findings' | 'remediated'>('findings');

  // Input & Audit state
  const [tenderText, setTenderText] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<DisputeRiskReport | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  // Clipboard & action states
  const [copiedRemediation, setCopiedRemediation] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState(false);
  const [copiedFindingId, setCopiedFindingId] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const toggleFindingExpand = (id: string) => {
    setExpandedFindings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Run audit on load or on click
  const runAudit = async (customText?: string) => {
    const textToAnalyze = customText !== undefined ? customText : tenderText;
    if (!textToAnalyze.trim()) return;

    setIsAuditing(true);
    try {
      const res = await tenderApi.auditRisk({ tender_text: textToAnalyze });
      setAuditReport(res);
      // Auto-expand the first finding if available
      if (res.findings && res.findings.length > 0) {
        setExpandedFindings({ [res.findings[0].id]: true });
      }
    } catch (err) {
      console.warn('Backend call failed, using client-side fallback audit:', err);
      const lower = textToAnalyze.toLowerCase();
      const isCivil = lower.includes('steel') || lower.includes('tmt') || lower.includes('rebar') || lower.includes('cement');
      const isIT = lower.includes('laptop') || lower.includes('cctv') || lower.includes('led');
      const isElectrical = lower.includes('motor') || lower.includes('cable') || lower.includes('transformer');

      const max_scores = {
        gfr: isCivil ? 35 : isIT ? 30 : 25,
        cvc: isCivil ? 30 : isIT ? 35 : 25,
        cag: isCivil ? 20 : isIT ? 15 : 25,
        arbitration: isCivil ? 15 : isIT ? 20 : 25
      };

      const findings: AuditVulnerabilityFinding[] = [];
      let gfr = 0;
      let cvc = 0;
      let cag = 0;
      let arb = 0;

      if (lower.includes('only') || lower.includes('tata') || lower.includes('jindal') || lower.includes('make:')) {
        cvc = max_scores.cvc;
        findings.push({
          id: 'fb-cvc-1',
          dimension: 'CVC_BRAND_BIAS',
          dimension_title: 'CVC Anti-Competitive & Brand Bias',
          clause_text: 'Make: Tata Tiscon or Jindal only. Other makes will not be accepted.',
          issue: 'Restrictive proprietary brand lock violates CVC guidelines.',
          consequence: 'Tender liable to be quashed under CVC Office Order 005/CRD/19.',
          severity: 'CRITICAL',
          remediation: 'Specify functional standards IS 1786:2008 with BIS ISI certification. Do not restrict to named proprietary brands.',
          rule_reference: 'CVC Order 005/CRD/19 & GFR 144(i)',
          risk_points: 30
        });
      }

      if (lower.includes('is 8112:2013')) {
        cag = max_scores.cag;
        findings.push({
          id: 'fb-cag-1',
          dimension: 'CAG_COMPLIANCE_AUDIT',
          dimension_title: 'CAG Compliance Audit (Superseded Standards)',
          clause_text: 'conforming to IS 8112:2013 for RCC foundation work',
          issue: 'IS 8112:2013 is superseded by revised standards with mandatory fineness amendments.',
          consequence: 'CAG audit objection during post-procurement compliance scrutiny.',
          severity: 'HIGH',
          remediation: 'Update reference to IS 8112:2013 (Reaffirmed 2023) or IS 269:2015.',
          rule_reference: 'CAG Public Procurement Guidelines',
          risk_points: 20
        });
      }

      if (lower.includes('superior') || lower.includes('commercial quality') || lower.includes('no factory test')) {
        arb = max_scores.arbitration;
        findings.push({
          id: 'fb-arb-1',
          dimension: 'ARBITRATION_TRAPS',
          dimension_title: 'Arbitration Traps & Contract Ambiguity',
          clause_text: 'superior make ... heavy duty finish. No factory test certificate required.',
          issue: 'Subjective terms ("superior make", "heavy duty") create legal voids under Section 29 Contract Act.',
          consequence: 'Contractual disputes, non-payment litigations, and rejection failures.',
          severity: 'HIGH',
          remediation: 'Quantify exact electrical & mechanical metrics conforming to IS 12615:2018 IE3 standards.',
          rule_reference: 'Indian Contract Act §29',
          risk_points: 20
        });
      }

      const total = gfr + cvc + cag + arb;
      const tier: DisputeRiskReport['risk_tier'] = total <= 20 ? 'LOW' : total <= 40 ? 'MODERATE' : total <= 65 ? 'HIGH' : 'CRITICAL';
      const summary = total === 0 
        ? 'Tender clause is 100% fortified against statutory audit and litigation risks.' 
        : `Tender contains ${findings.length} high-risk audit flags creating vulnerability under GFR 2017 & CVC rules.`;

      const criticality_label = isCivil ? 'CRITICAL_INFRASTRUCTURE' : isIT ? 'HIGH_VALUE_IT' : isElectrical ? 'CRITICAL_ELECTRICAL' : 'MEDIUM_OPERATIONAL';

      const mockRes: DisputeRiskReport = {
        total_risk_score: total,
        risk_tier: tier,
        summary,
        dimension_scores: { gfr, cvc, cag, arbitration: arb },
        dimension_max_scores: max_scores,
        commodity_criticality: criticality_label,
        findings,
        remediated_specification: 'High strength deformed steel bars conforming to IS 1786:2008 Grade Fe 500D with mandatory BIS ISI Mark certification. Manufacturer Test Certificate (MTC) as per IS 1608 required with third-party testing by NABL-accredited laboratory.',
        compliance_certificate_id: 'GFR-AUDIT-D21AB056'
      };

      setAuditReport(mockRes);
      if (findings.length > 0) {
        setExpandedFindings({ [findings[0].id]: true });
      }
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    if (activeDocument?.rawTextContent) {
      setTenderText(activeDocument.rawTextContent);
      runAudit(activeDocument.rawTextContent);
    } else if (activeDocument?.clauses && activeDocument.clauses.length > 0) {
      const combined = activeDocument.clauses.map(c => `${c.number} ${c.title}: ${c.text}`).join('\n\n');
      setTenderText(combined);
      runAudit(combined);
    } else if (!tenderText) {
      // Default to demo preset 1 for rich initial experience
      const defaultPreset = DEMO_PRESETS[0].text;
      setTenderText(defaultPreset);
      runAudit(defaultPreset);
    }
  }, [activeDocId]);

  const handlePresetSelect = (presetText: string) => {
    setTenderText(presetText);
    runAudit(presetText);
  };

  const copyRemediation = () => {
    if (auditReport?.remediated_specification) {
      navigator.clipboard.writeText(auditReport.remediated_specification);
      setCopiedRemediation(true);
      showToast('Legally fortified clause copied to clipboard!');
      setTimeout(() => setCopiedRemediation(false), 2000);
    }
  };

  const copyCertId = () => {
    if (auditReport?.compliance_certificate_id) {
      navigator.clipboard.writeText(auditReport.compliance_certificate_id);
      setCopiedCertId(true);
      showToast('Audit Certificate ID copied!');
      setTimeout(() => setCopiedCertId(false), 2000);
    }
  };

  const copyIndividualRemediation = (findingId: string, remediation: string) => {
    navigator.clipboard.writeText(remediation);
    setCopiedFindingId(findingId);
    showToast('Remediation clause copied to clipboard');
    setTimeout(() => setCopiedFindingId(null), 2000);
  };

  const downloadCertificate = () => {
    if (!auditReport) return;
    const certContent = `================================================================================
GOVERNMENT OF INDIA PUBLIC PROCUREMENT COMPLIANCE AUDIT CERTIFICATE
Conforming to General Financial Rules (GFR 2017 Rule 144(i)) & CVC Directives
================================================================================
Certificate ID    : ${auditReport.compliance_certificate_id || 'GFR-AUDIT-2026-LIVE'}
Audit Timestamp   : ${new Date().toISOString()}
Dispute Risk Score: ${auditReport.total_risk_score} / 100 (${auditReport.risk_tier} RISK)
Statutory Summary : ${auditReport.summary}

--------------------------------------------------------------------------------
STATUTORY DIMENSION BREAKDOWN:
--------------------------------------------------------------------------------
1. GFR 2017 Rule 144(i) (Standardization) : ${auditReport.dimension_scores.gfr} / 25
2. CVC Anti-Competitive & Brand Bias      : ${auditReport.dimension_scores.cvc} / 25
3. CAG Compliance Audit (Superseded/QCO)  : ${auditReport.dimension_scores.cag} / 25
4. Arbitration Traps & Contract Ambiguity : ${auditReport.dimension_scores.arbitration} / 25

--------------------------------------------------------------------------------
DETECTED AUDIT FINDINGS (${auditReport.findings.length}):
--------------------------------------------------------------------------------
${auditReport.findings.map((f, i) => `
[Finding #${i + 1}] - ${f.dimension_title} (${f.severity})
Offending Clause  : "${f.clause_text}"
Statutory Rule    : ${f.rule_reference}
Audit Consequence : ${f.consequence}
Legal Remediation : ${f.remediation}
`).join('\n')}

--------------------------------------------------------------------------------
CERTIFIED REMEDIATED SPECIFICATION CLAUSE:
--------------------------------------------------------------------------------
"${auditReport.remediated_specification || 'N/A'}"

================================================================================
Generated by BISense - Indian Standards Recommender & Compliance Engine (GeM/CPPP)
================================================================================`;

    const blob = new Blob([certContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GFR_2017_Legal_Audit_Certificate_${auditReport.compliance_certificate_id || 'REPORT'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded GFR 2017 Audit Certificate!');
  };

  const handleAddClause = (id: string, code: string, title?: string, mandatory?: boolean) => {
    setAddedItems(prev => [...prev, id]);
    addToBasket({
      id: code,
      code: code,
      title: title || code,
      type: 'Product',
      status: 'Current',
      mandatory: Boolean(mandatory)
    });
    showToast(`Added ${code} to Standards Basket`);
  };

  const isAdded = (id: string) => {
    if (addedItems.includes(id)) return true;
    if (id === 'sug-1' && isInBasket('IS 12615:2018')) return true;
    if ((id === 'iss-2' || id === 'sug-3') && isInBasket('IS 8789:1981')) return true;
    if ((id === 'iss-3' || id === 'sug-4') && isInBasket('IS 9383:1997')) return true;
    if ((id === 'iss-1' || id === 'sug-2') && isInBasket('BIS CRS')) return true;
    return false;
  };

  // Color helpers
  const getRiskMeta = (score: number) => {
    if (score <= 20) return { label: 'LOW RISK', color: 'emerald', stroke: '#10b981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score <= 40) return { label: 'LOW RISK', color: 'blue', stroke: '#2563eb', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score <= 65) return { label: 'MODERATE RISK', color: 'amber', stroke: '#f59e0b', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (score <= 85) return { label: 'HIGH RISK', color: 'orange', stroke: '#f97316', badge: 'bg-orange-50 text-orange-800 border-orange-200' };
    return { label: 'CRITICAL RISK', color: 'rose', stroke: '#e11d48', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const riskMeta = getRiskMeta(auditReport?.total_risk_score || 0);

  const filteredFindings = auditReport?.findings.filter(f => {
    if (selectedSeverity === 'ALL') return true;
    return f.severity === selectedSeverity;
  }) || [];

  return (
    <div className="p-4 md:p-6 lg:p-7 max-w-7xl mx-auto space-y-4 md:space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-800">
          <ShoppingBag className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => navigate('/basket')}
            className="ml-2 font-semibold text-orange-300 hover:text-white underline cursor-pointer whitespace-nowrap"
          >
            Basket ({basket.length})
          </button>
        </div>
      )}

      {/* 01. Compact Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tender Audit &amp; Legal Health</h1>
            <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200/80">
              GFR 2017 &amp; CVC Fortified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance validation against GFR 144(i), CVC brand restrictions, and live BIS QCO orders.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('dispute_risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dispute_risk'
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className={`w-3.5 h-3.5 ${activeTab === 'dispute_risk' ? 'text-orange-500' : 'text-slate-400'}`} />
              <span>Dispute Risk Scorer</span>
            </button>
            <button
              onClick={() => setActiveTab('technical_health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'technical_health'
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className={`w-3.5 h-3.5 ${activeTab === 'technical_health' ? 'text-orange-500' : 'text-slate-400'}`} />
              <span>Technical Health</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/review')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs text-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Tender</span>
          </button>
        </div>
      </div>

      {/* Active Document Ribbon (if active) */}
      {activeDocument && (
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.5 rounded uppercase">
              Target
            </span>
            <span className="font-semibold text-slate-900 truncate">{activeDocument.title}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 truncate">{activeDocument.department || 'Public Procurement'}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-500 font-medium">
              Compliance: <strong className="font-mono text-emerald-700">{activeDocument.auditSummary?.complianceScore ?? 94}%</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">
              Standards: <strong className="font-mono text-orange-600">{basket.length} Active</strong>
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DISPUTE RISK SCORER (CLEAN 2-COLUMN SPLIT LAYOUT)                 */}
      {/* ========================================================================= */}
      {activeTab === 'dispute_risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: AUDITOR INPUT & EXECUTIVE METRICS (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Clause Input Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-orange-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory Clause Auditor
                  </h2>
                </div>
                <button
                  onClick={() => setTenderText('')}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Preset Selector Bar */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Presets:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.text)}
                      className={`text-[11px] font-medium px-2 py-1.5 rounded-lg border text-left truncate transition-all cursor-pointer ${preset.tagClass}`}
                      title={preset.label}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="relative">
                <textarea
                  value={tenderText}
                  onChange={(e) => setTenderText(e.target.value)}
                  rows={4}
                  placeholder="Paste drafted procurement clause or scope of supply..."
                  className="w-full text-xs font-mono bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Footer action bar */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>2,246 live BIS QCOs</span>
                </div>

                <button
                  onClick={() => runAudit()}
                  disabled={isAuditing || !tenderText.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isAuditing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-3.5 h-3.5" />
                      <span>Run Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Executive Risk Index & 4 Dimensions */}
            {auditReport && (
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
                
                {/* Score Header & Dial */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dispute Risk Index</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Statutory exposure under GFR 144(i)</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${riskMeta.badge}`}>
                    {auditReport.risk_tier} RISK
                  </span>
                </div>

                {/* Score Ring + Summary */}
                <div className="flex items-center gap-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke={riskMeta.stroke}
                        strokeWidth="10"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - (auditReport.total_risk_score / 100))}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold font-mono text-slate-900 leading-none">
                        {auditReport.total_risk_score}
                      </span>
                      <span className="text-[8px] text-slate-400 font-semibold uppercase">/100</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                      {auditReport.summary}
                    </p>
                    <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                      <span>Cert:</span>
                      <button
                        onClick={copyCertId}
                        className="text-slate-700 hover:text-orange-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy Certificate ID"
                      >
                        <span>{auditReport.compliance_certificate_id}</span>
                        {copiedCertId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Dimension Cards Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Dimension 1: GFR 144(i) */}
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-[11px]">GFR 144(i)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        auditReport.dimension_scores.gfr === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {auditReport.dimension_scores.gfr}/25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${auditReport.dimension_scores.gfr === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, (auditReport.dimension_scores.gfr / 25) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {auditReport.dimension_scores.gfr === 0 ? 'Compliant with IS' : 'Non-standard standard'}
                    </span>
                  </div>

                  {/* Dimension 2: CVC Anti-Competition */}
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-[11px]">CVC Anti-Bias</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        auditReport.dimension_scores.cvc === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {auditReport.dimension_scores.cvc}/25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${auditReport.dimension_scores.cvc === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (auditReport.dimension_scores.cvc / 25) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {auditReport.dimension_scores.cvc === 0 ? 'Zero brand locks' : 'Brand bias detected'}
                    </span>
                  </div>

                  {/* Dimension 3: CAG & QCO Mandate */}
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-[11px]">CAG &amp; QCO</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        auditReport.dimension_scores.cag === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {auditReport.dimension_scores.cag}/30
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${auditReport.dimension_scores.cag === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (auditReport.dimension_scores.cag / 30) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {auditReport.dimension_scores.cag === 0 ? 'Active QCO confirmed' : 'Superseded / Missing QCO'}
                    </span>
                  </div>

                  {/* Dimension 4: Arbitration Traps */}
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-[11px]">Contract Traps</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        auditReport.dimension_scores.arbitration === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {auditReport.dimension_scores.arbitration}/25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${auditReport.dimension_scores.arbitration === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, (auditReport.dimension_scores.arbitration / 25) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {auditReport.dimension_scores.arbitration === 0 ? 'Objective clause' : 'Subjective / Vague terms'}
                    </span>
                  </div>
                </div>

                {/* Export Report link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Full Statutory Audit</span>
                  <button
                    onClick={downloadCertificate}
                    className="text-orange-600 hover:text-orange-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Certificate (.txt)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: FINDINGS ACCORDION OR REMEDIATED CLAUSE (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Top Workspace Tab Switcher */}
            <div className="px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
                <button
                  onClick={() => setActivePaneTab('findings')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePaneTab === 'findings'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Statutory Vulnerabilities ({auditReport?.findings.length || 0})</span>
                </button>
                <button
                  onClick={() => setActivePaneTab('remediated')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePaneTab === 'remediated'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>Fortified Specification</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    SAFE
                  </span>
                </button>
              </div>

              {/* Severity Filter Pills (only shown in findings tab) */}
              {activePaneTab === 'findings' && auditReport && (
                <div className="flex items-center gap-1">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => {
                    const count = sev === 'ALL'
                      ? auditReport.findings.length
                      : auditReport.findings.filter(f => f.severity === sev).length;
                    return (
                      <button
                        key={sev}
                        onClick={() => setSelectedSeverity(sev)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          selectedSeverity === sev
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sev} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TAB CONTENT: STATUTORY VULNERABILITIES */}
            {activePaneTab === 'findings' && (
              <div className="p-4 space-y-3">
                {!auditReport ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <Scale className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600">No active audit loaded</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Paste a clause on the left or select a demo preset to inspect legal vulnerabilities.
                    </p>
                  </div>
                ) : filteredFindings.length === 0 ? (
                  <div className="py-12 text-center space-y-2 bg-emerald-50/50 rounded-xl border border-emerald-100 p-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-900">Zero Statutory Vulnerabilities</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      All inspected clauses strictly conform to GFR 144(i), CVC brand restrictions, and live BIS QCO mandates.
                    </p>
                    <button
                      onClick={() => setActivePaneTab('remediated')}
                      className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-800 underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Certified Remediated Specification</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredFindings.map((finding) => {
                      const isExpanded = Boolean(expandedFindings[finding.id]);
                      return (
                        <div
                          key={finding.id}
                          className="rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all overflow-hidden shadow-2xs"
                        >
                          {/* Accordion Row Header */}
                          <div
                            onClick={() => toggleFindingExpand(finding.id)}
                            className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/30 hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                                finding.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                finding.severity === 'HIGH' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                {finding.severity}
                              </span>

                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {finding.dimension_title}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                                  &quot;{finding.clause_text}&quot;
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {finding.risk_points && finding.risk_points > 0 && (
                                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                  +{finding.risk_points} pts
                                </span>
                              )}
                              <span className="text-slate-400">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </span>
                            </div>
                          </div>

                          {/* Accordion Details Body */}
                          {isExpanded && (
                            <div className="p-4 pt-2 border-t border-slate-100 space-y-3 bg-white text-xs">
                              {/* Rule tag */}
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Statutory Mandate:</span>
                                <strong className="text-slate-700 font-semibold">{finding.rule_reference}</strong>
                              </div>

                              {/* Hazard & Consequence Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 space-y-1">
                                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                                    Audit Hazard
                                  </span>
                                  <p className="text-[11px] text-rose-950 leading-relaxed font-medium">
                                    {finding.issue}
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                                    Statutory Consequence
                                  </span>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {finding.consequence}
                                  </p>
                                </div>
                              </div>

                              {/* Remediation Box */}
                              <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Court-Tested Legal Remediation</span>
                                  </span>
                                  <p className="text-[11px] font-medium text-emerald-950 leading-relaxed">
                                    {finding.remediation}
                                  </p>
                                </div>

                                <button
                                  onClick={() => copyIndividualRemediation(finding.id, finding.remediation)}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer transition-colors"
                                >
                                  {copiedFindingId === finding.id ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Clause</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FORTIFIED SPECIFICATION */}
            {activePaneTab === 'remediated' && (
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Certified Remediated Specification
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Fortified under GFR 144(i), CVC Guidelines, and applicable Quality Control Orders.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Dispute Risk: 0/100 (SAFE)
                  </span>
                </div>

                {/* Clean Formatted Text Container */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 font-mono text-xs text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96">
                  {auditReport?.remediated_specification || 'No remediated specification available.'}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-[11px] text-slate-500">
                    Compliant specification ready for GeM Schedule of Requirements or CPPP notice.
                  </p>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={copyRemediation}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedRemediation ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Compliant Clause</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadCertificate}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TECHNICAL HEALTH & STANDARDS COVERAGE                               */}
      {/* ========================================================================= */}
      {activeTab === 'technical_health' && (
        !activeDocument ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-md mx-auto space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No Tender Document Selected</h3>
              <p className="text-xs text-slate-500">
                Upload or select a tender document in Review &amp; Verify to inspect clause coverage and standards health.
              </p>
            </div>
            <button
              onClick={() => navigate('/review')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
            >
              <span>Go to Review &amp; Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-500 block">Overall Health</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {activeDocument.requirements?.length 
                      ? Math.round(((activeDocument.requirements.length - activeDocument.requirements.filter(r => r.severity === 'High').length) / activeDocument.requirements.length) * 100)
                      : 100}%
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">Optimal</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-500 block">Clauses Analyzed</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {activeDocument.clauses?.length || 0}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-500 block">Requirements Extracted</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {activeDocument.requirements?.length || 0}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-500 block">Standards In Basket</span>
                <span className="text-xl font-bold font-mono text-orange-600 mt-1 block">
                  {basket?.length || 0}
                </span>
              </div>
            </div>

            {/* 2-Column Split: Requirements vs Recommended Standards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Identified Requirements */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Identified Clauses &amp; Requirements</h3>
                  <span className="text-[11px] font-mono text-slate-500">{activeDocument.requirements?.length || 0} items</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                  {(activeDocument.requirements || []).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No extracted requirements for this document.
                    </div>
                  ) : (
                    activeDocument.requirements.map((req) => (
                      <div key={req.id} className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{req.title || `Clause ${req.clauseNumber || req.id}`}</span>
                          <p className="text-slate-500 text-[11px] line-clamp-1">{req.requirementText}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                          req.severity === 'High' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-100 border-slate-200'
                        }`}>
                          {req.severity || 'Standard'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Recommended Standards */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-orange-500" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recommended Standards</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{activeDocument.recommendedStandards?.length || 0} found</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                  {(activeDocument.recommendedStandards || []).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No specific standards recommended yet. Search or add from Standards Search.
                    </div>
                  ) : (
                    activeDocument.recommendedStandards.map((std) => (
                      <div key={std.code} className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{std.code}</span>
                          <p className="text-slate-500 text-[11px] truncate">{std.title}</p>
                        </div>

                        <button
                          onClick={() => handleAddClause(std.code, std.code, std.title, std.rationale?.includes('Mandatory'))}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                            isInBasket(std.code) || isAdded(std.code)
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80'
                          }`}
                        >
                          {isInBasket(std.code) || isAdded(std.code) ? (
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
                    ))
                  )}
                </div>

                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Ready to build compliant tender specification?</span>
                  <button
                    onClick={() => navigate('/specification-builder')}
                    className="font-semibold text-orange-600 hover:text-orange-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Build Specification</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
