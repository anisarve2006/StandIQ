import { useState } from 'react';
import { 
  Save, 
  Check, 
  ChevronDown, 
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

type TabKey = 'General' | 'Notifications' | 'Modifiers' | 'Documents' | 'AI & Analysis' | 'Integration' | 'User Management';

export default function SettingsPage() {
  const { 
    setLanguage: setStoreLanguage, 
    setTheme: setStoreTheme, 
    setDateFormat: setStoreDateFormat,
    t,
    user 
  } = useStandIQ();

  const [activeTab, setActiveTab] = useState<TabKey>('General');
  const [saved, setSaved] = useState(false);

  // General tab state
  const [language, setLanguage] = useState(() => localStorage.getItem('standiq-lang') || 'English');
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('maanakai-theme');
    if (!stored) return 'Soothing';
    const cap = stored.charAt(0).toUpperCase() + stored.slice(1);
    if (cap === 'Soothing' || cap === 'Light' || cap === 'Dark' || cap === 'System') return cap;
    return 'Soothing';
  });
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('standiq-date-fmt') || 'DD MMM YYYY');
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('standiq-tz') || '(UTC+05:30) India Standard Time');
  const [itemsPerPage, setItemsPerPage] = useState(() => localStorage.getItem('standiq-items-per-page') || '20');

  // Notifications tab state
  const [notifyAmendments, setNotifyAmendments] = useState(true);
  const [notifyNewStandards, setNotifyNewStandards] = useState(true);
  const [notifyReviewAlerts, setNotifyReviewAlerts] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);

  // Modifiers tab state
  const [enforceLatestEdition, setEnforceLatestEdition] = useState(true);
  const [requireBISCrs, setRequireBISCrs] = useState(true);
  const [autoIncludeAllied, setAutoIncludeAllied] = useState(true);
  const [efficiencyThreshold, setEfficiencyThreshold] = useState('IE3 (Premium Efficiency)');

  // Documents tab state
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [maxUploadSize, setMaxUploadSize] = useState('50 MB');
  const [defaultExportFormat, setDefaultExportFormat] = useState('PDF');

  // AI & Analysis tab state
  const [modelEngine, setModelEngine] = useState(() => localStorage.getItem('maanakai-engine') || 'Deterministic Rule-Based Engine (Zero-LLM — Pure GFR & CVC Rules)');
  const [matchConfidenceThreshold, setMatchConfidenceThreshold] = useState(80);
  const [strictnessLevel, setStrictnessLevel] = useState<'Aggressive' | 'Balanced' | 'Conservative'>('Balanced');

  // Integration tab state
  const [gemSyncEnabled, setGemSyncEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('std_live_9f82d1c448ab29');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  // Live apply theme when selected in dropdown
  const applyTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setStoreTheme(selectedTheme as any);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaved(true);

    // Apply live to global store so whole application updates immediately
    setStoreLanguage(language as any);
    setStoreTheme(theme as any);
    setStoreDateFormat(dateFormat as any);

    // Persist all state
    localStorage.setItem('standiq-lang', language);
    localStorage.setItem('standiq-date-fmt', dateFormat);
    localStorage.setItem('standiq-tz', timeZone);
    localStorage.setItem('standiq-items-per-page', itemsPerPage);
    localStorage.setItem('maanakai-theme', theme.toLowerCase());
    localStorage.setItem('maanakai-engine', modelEngine);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const tabs: TabKey[] = [
    'General',
    'Notifications',
    'Modifiers',
    'Documents',
    'AI & Analysis',
    'Integration',
    'User Management'
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('settings')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your preferences and system configuration.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          {saved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Save className="w-4 h-4" />}
          <span>{saved ? t('savedChanges') : t('saveChanges')}</span>
        </button>
      </div>

      {/* 02. Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-semibold pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 pt-1 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab
                ? 'border-orange-600 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 03. Tab Content Viewport */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 md:p-8">
        
        {/* --- TAB 1: GENERAL --- */}
        {activeTab === 'General' && (
          <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default language for UI and generated specification templates.</p>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Theme
                </label>
                <div className="relative">
                  <select
                    value={theme}
                    onChange={(e) => applyTheme(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Soothing">Soothing (Eye-Care Warm Paper)</option>
                    <option value="Light">Crisp Light</option>
                    <option value="Dark">Obsidian Dark</option>
                    <option value="System">System Default</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Instant light or dark interface theme preference.</p>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Date Format
                </label>
                <div className="relative">
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="DD MMM YYYY">DD MMM YYYY (e.g. 24 Sep 2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-24)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/09/2026)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Time Zone
                </label>
                <div className="relative">
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="(UTC+05:30) India Standard Time">(UTC+05:30) India Standard Time</option>
                    <option value="(UTC+00:00) UTC">(UTC+00:00) UTC</option>
                    <option value="(UTC-05:00) Eastern Time">(UTC-05:00) Eastern Time</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Items Per Page
                </label>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* --- TAB 2: NOTIFICATIONS --- */}
        {activeTab === 'Notifications' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Alert & Notification Preferences</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control how and when you receive Indian Standards change updates.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'amendments',
                  title: 'Standard Amendments & Corrigenda',
                  desc: 'Get notified immediately when BIS issues amendments to standards in your active procurements.',
                  checked: notifyAmendments,
                  toggle: () => setNotifyAmendments(!notifyAmendments)
                },
                {
                  id: 'new-stds',
                  title: 'New Standards Published',
                  desc: 'Receive alerts when new Indian Standards or QCO notifications are published in your domain.',
                  checked: notifyNewStandards,
                  toggle: () => setNotifyNewStandards(!notifyNewStandards)
                },
                {
                  id: 'reviews',
                  title: 'Tender Review & Health Alerts',
                  desc: 'Alerts when a tender document analysis detects missing mandatory certification clauses.',
                  checked: notifyReviewAlerts,
                  toggle: () => setNotifyReviewAlerts(!notifyReviewAlerts)
                },
                {
                  id: 'weekly',
                  title: 'Weekly Compliance Digest',
                  desc: 'Email summary of standards reaffirmed, under review, or revised over the past 7 days.',
                  checked: notifyWeeklyDigest,
                  toggle: () => setNotifyWeeklyDigest(!notifyWeeklyDigest)
                }
              ].map((n) => (
                <div key={n.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    <p className="text-[11px] text-slate-500">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={n.checked}
                      onChange={n.toggle}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: MODIFIERS --- */}
        {activeTab === 'Modifiers' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Procurement Specification Modifiers</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enforce government policies and standards compliance criteria across tenders.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <div className="space-y-0.5 pr-4">
                  <h3 className="text-xs font-bold text-slate-900">Enforce Latest Standard Edition (Auto-Upgrade)</h3>
                  <p className="text-[11px] text-slate-500">Automatically flag superseded standards and replace them with the current reaffirmed edition.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceLatestEdition}
                  onChange={() => setEnforceLatestEdition(!enforceLatestEdition)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500/20 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <div className="space-y-0.5 pr-4">
                  <h3 className="text-xs font-bold text-slate-900">Mandatory BIS CRS Clause Verification</h3>
                  <p className="text-[11px] text-slate-500">Require bidders to provide valid Compulsory Registration Scheme mark for electrical and IT categories.</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireBISCrs}
                  onChange={() => setRequireBISCrs(!requireBISCrs)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500/20 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <div className="space-y-0.5 pr-4">
                  <h3 className="text-xs font-bold text-slate-900">Include Allied Standards Automatically</h3>
                  <p className="text-[11px] text-slate-500">When adding a product standard, automatically pull testing (e.g. IS 8789) and safety references.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoIncludeAllied}
                  onChange={() => setAutoIncludeAllied(!autoIncludeAllied)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500/20 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Minimum Energy Efficiency Mandate
                </label>
                <select
                  value={efficiencyThreshold}
                  onChange={(e) => setEfficiencyThreshold(e.target.value)}
                  className="w-full sm:w-80 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="IE3 (Premium Efficiency)">IE3 (Premium Efficiency - IS 12615)</option>
                  <option value="IE2 (High Efficiency)">IE2 (High Efficiency)</option>
                  <option value="IE4 (Super Premium)">IE4 (Super Premium Efficiency)</option>
                </select>
                <p className="text-[11px] text-slate-500">Default requirement benchmark enforced during automated tender parsing.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: DOCUMENTS --- */}
        {activeTab === 'Documents' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Document Parsing & Upload Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure tender document ingest limits and optical character recognition.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
                <label className="block text-xs font-bold text-slate-900">Max Document Upload Limit</label>
                <select
                  value={maxUploadSize}
                  onChange={(e) => setMaxUploadSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="25 MB">25 MB</option>
                  <option value="50 MB">50 MB</option>
                  <option value="100 MB">100 MB</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
                <label className="block text-xs font-bold text-slate-900">Default Export Format</label>
                <select
                  value={defaultExportFormat}
                  onChange={(e) => setDefaultExportFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="PDF">PDF (Official Specification Package)</option>
                  <option value="DOCX">DOCX (Editable Word)</option>
                  <option value="JSON">JSON (ERP Interop)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
              <div className="space-y-0.5 pr-4">
                <h3 className="text-xs font-bold text-slate-900">Enable Tesseract OCR for Scanned Tenders</h3>
                <p className="text-[11px] text-slate-500">Automatically run optical character recognition on scanned government PDF notices and gazettes.</p>
              </div>
              <input
                type="checkbox"
                checked={ocrEnabled}
                onChange={() => setOcrEnabled(!ocrEnabled)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500/20 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* --- TAB 5: AI & ANALYSIS --- */}
        {activeTab === 'AI & Analysis' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Retrieval & Decision Engine Configuration</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control procurement reasoning mode, deterministic rule compliance, and BIS catalog matching.</p>
            </div>

            {/* Deterministic Rule-Based Active Banner */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-bold text-emerald-950">Deterministic Rule-Based Engine Active</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Zero-LLM • Zero Hallucination
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    BharatGPT Disabled
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  All procurement recommendations, technical clause generation, and cross-lingual Indic matching operate strictly through deterministic rule algorithms, official BIS catalog records, and CVC / GFR 144(i) compliance checks without executing generative LLMs.
                </p>
              </div>
            </div>

            {/* Deterministic Architectural Guarantees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>GFR 144(i) & CVC Rules</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Strict deterministic regex scans detect trade names, single-vendor bias, and obsolete standard references.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Indian Trade Lexicon</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Sub-millisecond normalized vocabulary mapping across Hindi, Tamil, Telugu, Marathi, and Gujarati trade terms.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>5-Point GeM / CPPP Template</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Generates 100% grounded specification clauses with official BIS gazette dates and mandatory QCO orders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShieldAlert className="w-4 h-4 text-slate-600" />
                  <span>Air-Gapped Sovereign Isolation</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  No outgoing API calls to external cloud providers; local GGUF neural weights remain dormant.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-900">Active Model Engine</label>
                <select
                  value={modelEngine}
                  onChange={(e) => setModelEngine(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800"
                >
                  <option value="Deterministic Rule-Based Engine (Zero-LLM — Pure GFR & CVC Rules)">
                    Deterministic Rule-Based Engine (Zero-LLM — Pure GFR & CVC Rules) [Active]
                  </option>
                  <option value="Offline Local Graph & Catalogue Engine">
                    Offline Local Graph & Catalogue Engine (SQLite FTS5 + MaxSim)
                  </option>
                  <option value="MaanakAI Hybrid RAG (v2.4)">
                    MaanakAI Hybrid RAG (v2.4 — Semantic + TF-IDF BM25)
                  </option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>Match Confidence Threshold</span>
                  <span className="font-mono text-orange-600">{matchConfidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={matchConfidenceThreshold}
                  onChange={(e) => setMatchConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
                <p className="text-[11px] text-slate-500">Only standards meeting or exceeding this confidence score will be automatically recommended.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-900">Audit Rule Strictness</label>
                <div className="flex gap-2">
                  {(['Conservative', 'Balanced', 'Aggressive'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStrictnessLevel(lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        strictnessLevel === lvl 
                          ? 'bg-orange-600 text-white border-orange-600' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: INTEGRATION --- */}
        {activeTab === 'Integration' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">External Portals & API Integration</h2>
              <p className="text-xs text-slate-500 mt-0.5">Status of synchronized Indian standards databases and procurement platforms.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    BIS
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">BIS e-Sale Portal Live Sync</h3>
                    <p className="text-[11px] text-slate-500">Directly syncs official Indian Standards catalogue and amendments.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Connected</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs whitespace-nowrap shrink-0">
                    GeM
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Government e-Marketplace (GeM) Sync</h3>
                    <p className="text-[11px] text-slate-500">Export standardized specification templates straight to GeM catalogue.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gemSyncEnabled}
                  onChange={() => setGemSyncEnabled(!gemSyncEnabled)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500/20 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-900">BISense Organization API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(apiKey);
                      setApiKeyCopied(true);
                      setTimeout(() => setApiKeyCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {apiKeyCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Use this token to connect custom procurement pipelines via Python SDK / REST API.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 7: USER MANAGEMENT --- */}
        {activeTab === 'User Management' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Profile & Permissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage authenticated officer credentials and department assignment.</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {user.initials}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{user.name} Sarve</h3>
                  <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                  <span className="mt-1 inline-block text-[10px] bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded border border-orange-200">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-semibold text-slate-900">{user.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Security Clearance</span>
                  <p className="font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Level 3 (Full Tender Approval Authority)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
