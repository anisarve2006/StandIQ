import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Check, 
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  Scale,
  FileCheck2,
  AlertTriangle,
  Gavel,
  Copy,
  Download,
  RotateCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { tenderApi } from '../../services/tenderApi';
import type { DisputeRiskReport, AuditVulnerabilityFinding } from '../../types/api';

// Demo Presets for Hackathon Live Presentation
const DEMO_PRESETS = [
  {
    id: 'preset-cvc',
    label: '🚨 CVC Brand Bias',
    badge: 'High CVC Risk',
    color: 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100',
    text: 'Supply of TMT steel rebar Fe 500D for bridge construction. Make: Tata Tiscon or Jindal only. Other makes will not be accepted. Standard commercial quality.'
  },
  {
    id: 'preset-cag',
    label: '⚠️ CAG Obsolete Standard',
    badge: 'Superseded Standard',
    color: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
    text: 'Procurement of 43 Grade Ordinary Portland Cement conforming to IS 8112:2013 for RCC foundation work. Best quality material.'
  },
  {
    id: 'preset-arb',
    label: '🛑 Arbitration & Conflict Trap',
    badge: 'Contract Vagueness',
    color: 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
    text: 'Supply of superior make 15 kW motor. Operating voltage 415V continuous duty with 230V control coil without separate neutral. Heavy duty finish. No factory test certificate required.'
  },
  {
    id: 'preset-safe',
    label: '🛡️ 100% GFR 2017 Compliant',
    badge: 'Safe (0 Risk)',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    text: 'High strength deformed steel bars conforming to IS 1786:2008 Grade Fe 500D with mandatory BIS ISI Mark certification under the Steel & Steel Products Quality Control Order. Manufacturer Test Certificate (MTC) as per IS 1608 required with third-party pre-dispatch inspection by NABL-accredited laboratory.'
  }
];

export default function TenderHealthPage() {
  const navigate = useNavigate();
  const { addToBasket, isInBasket, basket, activeDocument } = useStandIQ();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dispute_risk' | 'technical_health'>('dispute_risk');

  // Input & Audit state
  const [tenderText, setTenderText] = useState(DEMO_PRESETS[0].text);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<DisputeRiskReport | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [copiedRemediation, setCopiedRemediation] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState(false);

  // Existing features state
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Run audit on load or on click
  const runAudit = async (customText?: string) => {
    const textToAnalyze = customText !== undefined ? customText : tenderText;
    if (!textToAnalyze.trim()) return;

    setIsAuditing(true);
    try {
      const res = await tenderApi.auditRisk({ tender_text: textToAnalyze });
      setAuditReport(res);
    } catch (err) {
      console.warn('Backend call failed, using client-side fallback audit:', err);
      // Fallback calculation with dynamic point distribution
      const lower = textToAnalyze.toLowerCase();
      const isCivil = lower.includes('steel') || lower.includes('tmt') || lower.includes('rebar') || lower.includes('cement');
      const isIT = lower.includes('laptop') || lower.includes('cctv') || lower.includes('led');
      const isElectrical = lower.includes('motor') || lower.includes('cable') || lower.includes('transformer');

      const max_scores = isCivil ? { gfr: 30, cvc: 25, cag: 30, arbitration: 20 } :
                         isIT ? { gfr: 20, cvc: 35, cag: 30, arbitration: 20 } :
                         isElectrical ? { gfr: 25, cvc: 25, cag: 30, arbitration: 25 } :
                         { gfr: 25, cvc: 25, cag: 25, arbitration: 25 };

      const multiplier = isCivil ? 1.25 : (isIT || isElectrical) ? 1.15 : 1.0;
      const criticality_label = isCivil ? "TIER_1_STRUCTURAL_SAFETY (1.25x Multiplier)" :
                                isIT ? "TIER_2_IT_ELECTRONICS_CRS (1.15x Multiplier)" :
                                isElectrical ? "TIER_2_ELECTRO_TECHNICAL (1.15x Multiplier)" :
                                "TIER_3_GENERAL (1.0x Baseline)";

      let gfr = 0, cvc = 0, cag = 0, arb = 0;
      const findings: AuditVulnerabilityFinding[] = [];

      if ((lower.includes('tata') || lower.includes('jindal') || lower.includes('only')) && !lower.includes('or equivalent')) {
        const pts = Math.min(max_scores.cvc, Math.round(23 * (isIT ? multiplier : 1.0)));
        cvc = pts;
        findings.push({
          id: 'cvc-fallback',
          dimension: 'CVC_COMPETITION',
          dimension_title: 'CVC Anti-Competitive & Restrictive Guidelines',
          severity: 'CRITICAL',
          clause_text: 'Make: Tata Tiscon or Jindal only',
          rule_reference: 'Central Vigilance Commission (CVC) Order No. 005/CRD/19 & GFR Rule 144(iii)',
          issue: "Proprietary brand name cited without unrestricted 'or equivalent' criterion.",
          consequence: 'Violates CVC transparency directives against restrictive brand-tailoring. High risk of pre-bid litigation.',
          remediation: 'Delete proprietary brand names. Replace with objective functional performance criteria and BIS standard grade parameters.',
          risk_points: pts
        });
      }

      if (lower.includes('8112')) {
        const pts = Math.min(max_scores.cag, Math.round(20 * multiplier));
        cag = pts;
        findings.push({
          id: 'cag-fallback',
          dimension: 'CAG_AUDIT',
          dimension_title: 'CAG Compliance Audit Vulnerability',
          severity: 'HIGH',
          clause_text: 'IS 8112:2013 43 Grade Cement',
          rule_reference: 'CAG Compliance Audit Guidelines & BIS Standardization Directives',
          issue: "Cited standard 'IS 8112:2013' is superseded and withdrawn by BIS into IS 269:2015.",
          consequence: 'CAG audit objection regarding public expenditure governed by obsolete engineering standards.',
          remediation: "Replace 'IS 8112:2013' with current active unified standard 'IS 269:2015'.",
          risk_points: pts
        });
      }

      if (lower.includes('415v') && lower.includes('230v')) {
        const pts = Math.min(max_scores.arbitration - arb, 18);
        arb += pts;
        findings.push({
          id: 'arb-fallback',
          dimension: 'ARBITRATION_TRAP',
          dimension_title: 'Arbitration Trap & Contract Ambiguity',
          severity: 'CRITICAL',
          clause_text: 'Rated 415V continuous duty with 230V control without transformer',
          rule_reference: 'Indian Contract Act 1872 Section 29 (Uncertainty)',
          issue: 'Contradictory electrical voltage parameters in technical scope.',
          consequence: 'Fatal contractual ambiguity leading to contractor variation claims and installation failure.',
          remediation: 'Segregate 3-phase (415V) power circuit from 1-phase (230V) control circuit with dedicated step-down transformer.',
          risk_points: pts
        });
      }

      if (lower.includes('standard commercial') || lower.includes('best quality') || lower.includes('heavy duty finish')) {
        const pts = Math.min(max_scores.arbitration - arb, 8);
        arb += pts;
        findings.push({
          id: 'arb-vague',
          dimension: 'ARBITRATION_TRAP',
          dimension_title: 'Arbitration Trap & Contract Ambiguity',
          severity: 'MEDIUM',
          clause_text: 'commercial quality / best quality',
          rule_reference: 'Manual for Procurement of Goods 2024 §2.1 & Contract Act §29',
          issue: 'Subjective adjective used without quantifiable technical acceptance criteria.',
          consequence: 'Unenforceable rejection criteria during vendor dispute arbitration.',
          remediation: 'Specify precise numerical tolerances and chemical/mechanical limits as per BIS standard.',
          risk_points: pts
        });
      }

      const total = Math.min(100, gfr + cvc + cag + arb);
      let tier: DisputeRiskReport['risk_tier'] = 'SAFE';
      let summary = 'Tender exhibits pristine statutory compliance with GFR Rule 144(i), CVC guidelines, and BIS mandatory QCO directives.';
      if (total > 85) {
        tier = 'CRITICAL';
        summary = 'Critical statutory hazard. Violates GFR 2017 Rule 144(i) and Central Vigilance directives. High probability of tender cancellation or arbitration.';
      } else if (total > 65) {
        tier = 'HIGH';
        summary = 'High risk of CAG audit objections or CVC inquiry due to restrictive brand tailoring, superseded standards, or missing mandatory QCOs.';
      } else if (total > 40) {
        tier = 'MODERATE';
        summary = 'Moderate dispute vulnerability. Omissions in testing protocols, ambiguous terminology, or indicative brand names require revision.';
      } else if (total > 20) {
        tier = 'LOW';
        summary = 'Low dispute risk. Minor formatting or non-blocking technical refinements suggested to fortify inspection clauses.';
      }

      setAuditReport({
        total_risk_score: total,
        risk_tier: tier,
        summary,
        dimension_scores: { gfr, cvc, cag, arbitration: arb },
        dimension_max_scores: max_scores,
        commodity_criticality: criticality_label,
        findings,
        remediated_specification: 'High strength deformed steel bars conforming to IS 1786:2008 Grade Fe 500D with mandatory BIS ISI Mark certification. Manufacturer Test Certificate (MTC) as per IS 1608 required with third-party testing by NABL-accredited laboratory.',
        compliance_certificate_id: 'GFR-AUDIT-E8F94D2B'
      });
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    runAudit(DEMO_PRESETS[0].text);
  }, []);

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
Generated by MaanakAI - Indian Standards Recommender & Compliance Engine (GeM/CPPP)
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

  // Color helpers
  const getRiskColor = (score: number) => {
    if (score <= 20) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score <= 40) return { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score <= 65) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score <= 85) return { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const currentRiskColor = getRiskColor(auditReport?.total_risk_score || 0);

  const filteredFindings = auditReport?.findings.filter(f => {
    if (selectedSeverity === 'ALL') return true;
    return f.severity === selectedSeverity;
  }) || [];

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
            </div>
          )}

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
      )}
    </div>
  );
}
