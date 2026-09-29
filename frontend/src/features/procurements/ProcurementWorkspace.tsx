import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { DataList } from '../../components/ui/DataList';
import { Mono, Meta, Body } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
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
        title: 'Operating Conditions & Ambient Environment',
        text: `Intended Application: ${draft.application || 'Standard industrial duty'}. Operating Environment: ${draft.environment || 'Standard tropical conditions conforming to Indian Standards'}.`,
        isHighlighted: false,
      },
    ];

    const requirements: ExtractedRequirement[] = [
      {
        id: 1,
        title: 'Core Product Compliance',
        severity: 'High',
        requirementText: draft.description || 'Core technical specification parameter.',
        recommendedStandard: matchedStandardCode,
        status: 'accepted',
        clauseNumber: '1.1',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 2,
        title: 'Technical Performance Verification',
        severity: 'High',
        requirementText: draft.technicalSpec || 'Performance, testing and quality verification clause.',
        recommendedStandard: matchedStandardCode,
        status: 'accepted',
        clauseNumber: '1.2',
        category: 'Testing',
        isMandatoryQco: true,
      },
      {
        id: 3,
        title: 'Environmental & Operational Safeguards',
        severity: 'Medium',
        requirementText: `Operational limits: ${draft.environment || 'Standard operating limits'}`,
        recommendedStandard: 'IS/ISO 9001:2015',
        status: 'pending',
        clauseNumber: '1.3',
        category: 'Safety',
      }
    ];

    const recommendedStandards: RecommendedStandardItem[] = [
      {
        code: matchedStandardCode,
        title: matchedStandardTitle,
        match: 95,
        type: primaryType,
        status: 'Current',
        rationale: 'Primary benchmark Indian Standard mandated under public procurement guidelines.',
      },
      {
        code: 'IS/ISO 9001:2015',
        title: 'Quality Management Systems - Requirements',
        match: 90,
        type: 'Product',
        status: 'Current',
        rationale: 'Mandatory quality assurance certification for vendor manufacturing facilities.',
      },
    ];

    // Dedicated Basket for this new document
    const dedicatedBasket = [
      {
        id: matchedStandardCode,
        code: matchedStandardCode,
        title: matchedStandardTitle,
        type: primaryType,
        status: 'Current' as const,
        mandatory: true,
      },
      {
        id: 'IS/ISO 9001:2015',
        code: 'IS/ISO 9001:2015',
        title: 'Quality Management Systems - Requirements',
        type: 'Product' as const,
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

  const describeTab = (
    <div className="flex flex-col gap-6 p-6 border border-border border-t-0 bg-surface">
      <Textarea
        label="PRODUCT / SERVICE"
        placeholder="Describe the product, equipment, material or service..."
        value={draft.description}
        onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
        required
        rows={3}
      />
      <Textarea
        label="TECHNICAL SPECIFICATION"
        placeholder="Enter technical requirements, dimensions, ratings, materials, operating conditions, etc."
        value={draft.technicalSpec}
        onChange={(e) => setDraft(prev => ({ ...prev, technicalSpec: e.target.value }))}
        rows={5}
      />
      <Input
        label="APPLICATION / INTENDED USE"
        placeholder="e.g. Industrial heavy duty, continuous operation"
        value={draft.application}
        onChange={(e) => setDraft(prev => ({ ...prev, application: e.target.value }))}
      />
      <Input
        label="OPERATING ENVIRONMENT"
        placeholder="e.g. Outdoor tropical -5°C to 50°C, 95% RH"
        value={draft.environment}
        onChange={(e) => setDraft(prev => ({ ...prev, environment: e.target.value }))}
      />
      <Input
        label="EXISTING STANDARD REFERENCES"
        placeholder="e.g. IS 12615, IS 325, IS 800"
        value={draft.existingStandards}
        onChange={(e) => setDraft(prev => ({ ...prev, existingStandards: e.target.value }))}
      />
      <div className="flex items-center justify-between pt-2">
        <Select
          label="INPUT LANGUAGE"
          value={draft.language}
          onChange={(e) => setDraft(prev => ({ ...prev, language: e.target.value }))}
          options={[
            { value: 'auto', label: 'Auto-detect' },
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'Hindi' },
            { value: 'mr', label: 'Marathi' },
          ]}
        />
        <button
          type="button"
          onClick={resetProcurementDraft}
          className="text-xs text-text-muted hover:text-rose-600 transition-colors underline pt-5"
        >
          Reset Draft Form
        </button>
      </div>
    </div>
  );

  const uploadTab = (
    <div className="flex flex-col gap-6 p-6 border border-border border-t-0 bg-surface">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.xlsx,.xls,.csv,.txt"
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
          className="border-2 border-dashed border-border p-10 flex flex-col items-center justify-center text-center rounded-sm hover:border-text-secondary cursor-pointer transition-colors"
        >
          <Mono className="text-text-secondary mb-2">DROP TENDER DOCUMENT OR SCANNED IMAGE</Mono>
          <Meta className="mb-2">PDF (DIGITAL & OCR SCANNED) / PNG / JPG / EXCEL / CSV / TXT</Meta>
          <span className="text-[10px] text-text-muted mb-4 font-mono">Auto-detects digital text; runs OCR for scanned pages</span>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}>
            SELECT FILE
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border border-border bg-surface-elevated rounded-sm">
          <div className="flex flex-col gap-1">
            <Mono className="text-text-primary font-bold">{draft.fileName || selectedFile?.name}</Mono>
            <Meta>{draft.fileSize || `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`}</Meta>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="success">READY</Badge>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Text Field in Upload Section */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <Input
          label="TENDER TITLE / REFERENCE NUMBER"
          placeholder="e.g. GEM/2026/B/8912401 or High Voltage Transformers Package"
          value={draft.fileName || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, fileName: e.target.value }))}
        />
        <Textarea
          label="OR ENTER SPECIFICATION TEXT DIRECTLY (NO FILE NEEDED)"
          placeholder="Paste or type technical specification clauses, BoQ lines, or product ratings here..."
          value={draft.technicalSpec || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, technicalSpec: e.target.value }))}
          rows={3}
        />
      </div>
      <Select
        label="DOCUMENT LANGUAGE"
        value={draft.language}
        onChange={(e) => setDraft(prev => ({ ...prev, language: e.target.value }))}
        options={[
          { value: 'auto', label: 'Auto-detect' },
          { value: 'en', label: 'English' },
          { value: 'hi', label: 'Hindi' },
        ]}
      />
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="NEW PROCUREMENT"
        title="STANDARD INTELLIGENCE WORKSPACE"
        description="Describe what you are procuring or provide an existing tender/specification for analysis. Data is automatically preserved across all tabs."
      />

      <SplitPane
        primary={
          <div className="flex flex-col gap-6">
            <SectionHeader number="01" title="PROCUREMENT INPUT" />
            <div className="flex flex-col">
              <Tabs
                defaultActive={draft.mode}
                onChange={(id: string) => setDraft(prev => ({ ...prev, mode: id as 'describe' | 'upload' }))}
                tabs={[
                  { id: 'describe', label: 'DESCRIBE PROCUREMENT', content: describeTab },
                  { id: 'upload', label: 'UPLOAD TENDER', content: uploadTab },
                ]}
              />
            </div>
            {error && <ErrorState title="VALIDATION ERROR" description={error} />}
            <div className="flex justify-end pt-4">
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? 'ANALYZING SPECIFICATION...' : 'ANALYZE PROCUREMENT →'}
              </Button>
            </div>
          </div>
        }
        secondary={
          <div className="flex flex-col gap-6 sticky top-8">
            <SectionHeader number="02" title="ANALYSIS CONTEXT" />
            <div className="p-6 border border-border bg-surface flex flex-col gap-8 rounded-sm">
              <div className="flex flex-col gap-2">
                <Meta>INPUT STATUS</Meta>
                {isReady ? (
                  <Badge variant="success" className="w-fit">READY FOR ANALYSIS</Badge>
                ) : (
                  <Badge variant="warning" className="w-fit">WAITING FOR INPUT</Badge>
                )}
              </div>
              <DataList
                items={[
                  { label: 'LANGUAGE', value: draft.language === 'auto' ? 'AUTO-DETECT' : draft.language.toUpperCase() },
                  { label: 'INPUT TYPE', value: draft.mode === 'describe' ? 'PRODUCT DESCRIPTION' : 'TENDER DOCUMENT' },
                  { label: 'DOCUMENT', value: draft.fileName ? 'ATTACHED' : 'NOT ATTACHED' },
                  { label: 'PERSISTENCE', value: 'AUTO-SAVED IN STORE' },
                ]}
              />
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <Meta>STATE PERSISTENCE</Meta>
                <Body className="text-xs text-text-secondary">
                  Your inputs are safely stored in frontend state. You can freely switch tabs or inspect standards without losing any work.
                </Body>
              </div>
            </div>
          </div>
        }
      />
    </PageContainer>
  );
}
