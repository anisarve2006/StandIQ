import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Upload, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useStandIQ, type AnalyzedDocument, type ExtractedRequirement, type RecommendedStandardItem } from '../../stores/standiq.store';

export default function ProcurementWorkspace() {
  const navigate = useNavigate();
  const { 
    procurementDraft: draft, 
    setProcurementDraft: setDraft, 
    resetProcurementDraft,
    addOrUpdateDocument,
    setActiveDocId 
  } = useStandIQ();

  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDraft(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      }));
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDraft(prev => ({ ...prev, fileName: null, fileSize: null }));
  };

  const validate = () => {
    if (draft.mode === 'describe') {
      if (!draft.description.trim()) return 'Product Description is required.';
    } else {
      if (!selectedFile && !draft.fileName && !draft.technicalSpec?.trim()) {
        return 'Please upload a tender document or enter specification text.';
      }
    }
    return null;
  };

  const handleAnalyze = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setAnalyzing(true);

    // If uploading a tender file, route to review with the file
    if (draft.mode === 'upload' && selectedFile) {
      navigate('/review', { state: { autoUploadFile: selectedFile } });
      setAnalyzing(false);
      return;
    }

    // Direct text or description analysis: create persistent AnalyzedDocument
    const combinedText = `${draft.description} ${draft.technicalSpec} ${draft.application} ${draft.environment}`.toLowerCase();
    const docId = `proc-${Date.now()}`;
    const docTitle = draft.fileName 
      ? draft.fileName.replace(/\.[^/.]+$/, '').toUpperCase()
      : draft.description.length > 50 
      ? draft.description.slice(0, 50).toUpperCase() + '...' 
      : (draft.description || 'CUSTOM PROCUREMENT SPECIFICATION').toUpperCase();

    let category = 'Industrial Equipment';
    let matchedStandardCode = 'IS 12615:2018';
    let matchedStandardTitle = 'Energy Efficient Induction Motors (Three-phase)';
    let primaryType: 'Product' | 'Testing' | 'Safety' = 'Product';

    if (combinedText.includes('panel') || combinedText.includes('switchgear') || combinedText.includes('breaker')) {
      category = 'Electrical Equipment';
      matchedStandardCode = 'IS/IEC 61439-1:2011';
      matchedStandardTitle = 'Low-Voltage Switchgear and Controlgear Assemblies';
    } else if (combinedText.includes('solar') || combinedText.includes('pv') || combinedText.includes('inverter')) {
      category = 'Renewable Energy';
      matchedStandardCode = 'IS 16221 (Part 2):2015';
      matchedStandardTitle = 'Safety of Power Converters for Photovoltaic Power Systems';
      primaryType = 'Safety';
    } else if (combinedText.includes('pump') || combinedText.includes('water') || combinedText.includes('hydraulic')) {
      category = 'Water & Pumping';
      matchedStandardCode = 'IS 1520:1980';
      matchedStandardTitle = 'Horizontal Centrifugal Pumps for Clear, Cold Water';
    } else if (combinedText.includes('steel') || combinedText.includes('tmt') || combinedText.includes('rebar')) {
      category = 'Construction Materials';
      matchedStandardCode = 'IS 1786:2008';
      matchedStandardTitle = 'High Strength Deformed Steel Bars for Concrete Reinforcement';
    } else if (draft.existingStandards?.trim()) {
      matchedStandardCode = draft.existingStandards.trim().split(',')[0].trim();
      matchedStandardTitle = `Statutory Standard (${matchedStandardCode})`;
    }

    // Synthesize structured clauses from user inputs
    const clauses = [
      {
        id: 'c-1',
        number: '1.1',
        title: 'Product Description & Scope of Supply',
        text: draft.description || 'Procurement scope and general product technical baseline requirements.',
        isHighlighted: true,
        highlightNote: 'Primary Procurement Scope',
        matchedRequirementId: 1,
        matchedStandard: matchedStandardCode,
      },
      {
        id: 'c-2',
        number: '1.2',
        title: 'Technical Specification & Ratings',
        text: draft.technicalSpec || 'Technical parameters, operating characteristics, and performance thresholds.',
        isHighlighted: true,
        highlightNote: 'Technical Verification Clause',
        matchedRequirementId: 2,
        matchedStandard: matchedStandardCode,
      },
      {
        id: 'c-3',
        number: '1.3',
        title: 'Operating Conditions & Site Parameters',
        text: `Application: ${draft.application || 'Standard duty'}. Environmental conditions: ${draft.environment || 'Standard tropical'}.`,
        isHighlighted: false,
      }
    ];

    const requirements: ExtractedRequirement[] = [
      {
        id: 1,
        clauseNumber: '1.1',
        requirementText: draft.description || 'Primary scope of supply',
        category: category,
        severity: 'High',
        recommendedStandard: matchedStandardCode,
        isMandatoryQco: true,
        confidenceScore: 98,
        status: 'accepted',
        title: 'Scope of Supply Compliance',
        rationale: `Mandatory Quality Control Order mandates BIS ISI Certification for ${category}.`
      },
      {
        id: 2,
        clauseNumber: '1.2',
        requirementText: draft.technicalSpec || 'Rating and performance specifications',
        category: category,
        severity: 'Medium',
        recommendedStandard: matchedStandardCode,
        isMandatoryQco: true,
        confidenceScore: 92,
        status: 'accepted',
        title: 'Performance & Rating Standards',
        rationale: 'Conformity with latest reaffirmed Indian Standard revisions required under GFR 144(i).'
      }
    ];

    const recommendedStandards: RecommendedStandardItem[] = [
      {
        code: matchedStandardCode,
        title: matchedStandardTitle,
        type: primaryType,
        match: 98,
        status: 'Current',
        rationale: `Directly aligns with ${category} scope. Quality Control Order mandates compulsory BIS ISI mark.`,
        confidence: 'HIGH',
        relevanceScore: 98,
      }
    ];

    const dedicatedBasket = [
      {
        id: matchedStandardCode,
        code: matchedStandardCode,
        title: matchedStandardTitle,
        type: primaryType,
        mandatory: true,
        status: 'Current' as const,
      }
    ];

    const newDoc: AnalyzedDocument = {
      id: docId,
      fileName: draft.fileName || `${docTitle.slice(0, 30).replace(/\s+/g, '_')}.pdf`,
      fileSize: draft.fileSize || '1.2 MB',
      totalPages: 12,
      department: 'CENTRAL PUBLIC PROCUREMENT PORTAL (GeM / CPPP)',
      tenderNumber: `GEM/PR/${Date.now().toString().slice(-6)}`,
      title: docTitle,
      section: 'SECTION 1 — AI PARSED SPECIFICATIONS',
      category: category,
      uploadedAt: 'Today',
      status: 'In Review',
      fileType: draft.mode === 'upload' ? 'pdf' : 'text',
      rawTextContent: `${draft.description}\n\n${draft.technicalSpec}`,
      clauses,
      requirements,
      recommendedStandards,
      auditSummary: {
        pages: 12,
        totalItems: requirements.length,
        mandatoryQcoItems: 2,
        voluntaryItems: 1,
        complianceScore: 94,
        processingTimeSeconds: 1.1,
      },
      basket: dedicatedBasket,
    };

    addOrUpdateDocument(newDoc);
    setActiveDocId(docId);
    setAnalyzing(false);
    navigate('/review', { state: { selectedDocId: docId } });
  };

  const isReady = draft.mode === 'describe' 
    ? draft.description.length > 0 
    : (!!selectedFile || !!draft.fileName || (draft.technicalSpec && draft.technicalSpec.length > 0));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Breadcrumb & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <button 
            onClick={() => navigate('/procurements')} 
            className="hover:text-slate-600 transition-colors cursor-pointer"
          >
            Procurements
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">New Procurement Workspace</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Procurement Workspace</h1>
              <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200/80">
                Standards Alignment
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft procurement specifications or upload tender packages to auto-discover mandatory BIS standards and QCO mandates.
            </p>
          </div>
        </div>
      </div>

      {/* 02. Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Forms (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl max-w-md">
            <button
              type="button"
              onClick={() => setDraft(prev => ({ ...prev, mode: 'describe' }))}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                draft.mode === 'describe'
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Describe Specification
            </button>
            <button
              type="button"
              onClick={() => setDraft(prev => ({ ...prev, mode: 'upload' }))}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                draft.mode === 'upload'
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Tender Document
            </button>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Describe Mode */}
          {draft.mode === 'describe' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Product / Equipment / Service Scope <span className="text-orange-600">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Supply of Three-Phase Induction Motors 15 kW IE3 efficiency rating for municipal water pumping station..."
                  value={draft.description}
                  onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Technical Specifications &amp; Ratings
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter operating voltage (e.g. 415V), continuous duty S1, class F insulation, IP55 enclosure, test certificates required..."
                  value={draft.technicalSpec}
                  onChange={(e) => setDraft(prev => ({ ...prev, technicalSpec: e.target.value }))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Application / Intended Use
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Industrial heavy duty, continuous operation"
                    value={draft.application}
                    onChange={(e) => setDraft(prev => ({ ...prev, application: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Operating Environment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Outdoor tropical, -5°C to 50°C, 95% RH"
                    value={draft.environment}
                    onChange={(e) => setDraft(prev => ({ ...prev, environment: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Existing Standard References (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. IS 12615, IS 325, IS 800"
                  value={draft.existingStandards}
                  onChange={(e) => setDraft(prev => ({ ...prev, existingStandards: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Upload Mode */}
          {draft.mode === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.txt"
                className="hidden"
              />

              {!draft.fileName && !selectedFile ? (
                <div 
                  onClick={handleFileSelect}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setDraft(prev => ({
                        ...prev,
                        fileName: file.name,
                        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                      }));
                      setError(null);
                    }
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-orange-500 p-8 flex flex-col items-center justify-center text-center rounded-2xl cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/20 space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Upload className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">
                      Drop Tender Document (PDF, Word, Scanned Notice)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports scanned PDFs with automated Tesseract OCR &amp; Indic parsing
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}
                    className="px-4 py-1.5 bg-white border border-slate-200 hover:border-orange-500 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{draft.fileName || selectedFile?.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">{draft.fileSize || '1.2 MB'} • Ready for analysis</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Tender Reference / Identifier (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GEM/2026/B/8912401 or Metro Rail Traction Tender"
                  value={draft.fileName || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, fileName: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Or Paste Specification Clauses Directly
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste drafted procurement clauses or technical specifications here..."
                  value={draft.technicalSpec || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, technicalSpec: e.target.value }))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* Reset button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={resetProcurementDraft}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Draft Form</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Context & Execution Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5 sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analysis Status</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isReady 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isReady ? 'Ready for Analysis' : 'Awaiting Input'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Input Mode</span>
              <span className="font-bold text-slate-800">
                {draft.mode === 'describe' ? 'Product Description' : 'Tender Document'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Language</span>
              <span className="font-bold text-slate-800 font-mono">
                {draft.language === 'auto' ? 'Auto-Detect (Indic)' : draft.language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Target Grounding</span>
              <span className="font-bold text-emerald-700">2,246 live BIS QCOs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/70 space-y-1">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>What Happens Next?</span>
            </span>
            <p className="text-xs text-orange-950 leading-relaxed font-medium">
              BISense parses all technical specifications, aligns product categories against Bureau of Indian Standards catalogs, flags Quality Control Orders, and creates your audit-ready procurement review.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !isReady}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {analyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Specification...</span>
              </>
            ) : (
              <>
                <span>Analyze Procurement &amp; Align Standards</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
