import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Check, 
  Plus, 
  X,
  Share2,
  FileCheck,
  FileUp,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet,
  FileCode2,
  ImageIcon,
  Copy,
  Download,
  Clock,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { useStandIQ, type BasketStandard, type AnalyzedDocument } from '../../stores/standiq.store';
import { exportDocumentToPdf, copyDocumentOutput } from '../../services/pdfExport';
import { API_BASE_URL } from '../../services/api';

export interface ExtractedRequirement {
  id: number;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  requirementText: string;
  recommendedStandard?: string;
  status: 'pending' | 'accepted';
  clauseNumber?: string;
  category?: string;
  specificationGaps?: string[];
  specificationClause?: string;
  isMandatoryQco?: boolean;
  regulatoryStatus?: 'MANDATORY' | 'NOT_VERIFIED' | 'EXEMPTED_OR_DENOTIFIED';
  qcoEvidence?: string;
  qcoEffectiveDate?: string;
  qcoScope?: string;
  qcoReason?: string;
}

export interface RecommendedStandardItem {
  code: string;
  title: string;
  match: number;
  type: BasketStandard['type'];
  status: BasketStandard['status'];
  rationale: string;
  regulatoryStatus?: string;
  qcoEvidence?: string;
  qcoEffectiveDate?: string;
  qcoScope?: string;
}

export interface AuditSummary {
  pages: number | string;
  totalItems: number;
  mandatoryQcoItems: number;
  voluntaryItems: number;
  complianceScore: number;
  processingTimeSeconds: number;
}

interface DocumentClause {
  id: string;
  number: string;
  title: string;
  text: string;
  isHighlighted?: boolean;
  highlightNote?: string;
  matchedRequirementId?: number;
  matchedStandard?: string;
}

interface TenderDocumentData {
  id: string;
  fileName: string;
  fileSize: string;
  totalPages: number;
  department: string;
  tenderNumber: string;
  title: string;
  section: string;
  clauses: DocumentClause[];
  requirements: ExtractedRequirement[];
  recommendedStandards: RecommendedStandardItem[];
}

const EMPTY_TENDER_DOC: TenderDocumentData = {
  id: '',
  fileName: 'No Document Loaded',
  fileSize: '0 KB',
  totalPages: 0,
  department: 'No Tender Selected',
  tenderNumber: 'N/A',
  title: 'Upload or Select a Tender Document to Begin Analysis',
  section: 'N/A',
  clauses: [],
  requirements: [],
  recommendedStandards: []
};

export default function ReviewVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    documents, 
    activeDocId, 
    activeDocument, 
    setActiveDocId, 
    addOrUpdateDocument, 
    updateDocumentRequirements, 
    basket, 
    addToBasket, 
    removeFromBasket, 
    isInBasket 
  } = useStandIQ();

  // Track whether a real user document has been uploaded in this session
  const [isDocumentLoaded, setIsDocumentLoaded] = useState<boolean>(() => {
    try {
      const state = location.state as any;
      if (state?.autoUploadFile) return true;
      const stored = sessionStorage.getItem('standiq_review_active_doc');
      // Strictly accept only user-uploaded documents (uploaded-* or custom-*)
      return Boolean(stored && (stored.startsWith('uploaded-') || stored.startsWith('custom-')));
    } catch {
      return false;
    }
  });

  // Active document data & state (only populated if a user-uploaded document is loaded)
  const [currentDoc, setCurrentDoc] = useState<TenderDocumentData>(() => {
    try {
      const stored = sessionStorage.getItem('standiq_review_active_doc');
      if (stored && (stored.startsWith('uploaded-') || stored.startsWith('custom-'))) {
        const found = documents.find(d => d.id === stored);
        if (found) return found as any;
      }
    } catch (e) {
      console.warn(e);
    }
    return EMPTY_TENDER_DOC;
  });

  const [requirements, setRequirements] = useState<ExtractedRequirement[]>(() => {
    try {
      const stored = sessionStorage.getItem('standiq_review_active_doc');
      if (stored && (stored.startsWith('uploaded-') || stored.startsWith('custom-'))) {
        const found = documents.find(d => d.id === stored);
        if (found?.requirements) return found.requirements;
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [recommendedStandards, setRecommendedStandards] = useState<RecommendedStandardItem[]>(() => {
    try {
      const stored = sessionStorage.getItem('standiq_review_active_doc');
      if (stored && (stored.startsWith('uploaded-') || stored.startsWith('custom-'))) {
        const found = documents.find(d => d.id === stored);
        if (found?.recommendedStandards) return found.recommendedStandards;
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });
  
  // Custom uploaded file state
  const [uploadedBlobUrl, setUploadedBlobUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'image' | 'text' | 'office' | 'other'>('pdf');
  const [rawTextContent, setRawTextContent] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<'preview' | 'document'>('document');
  const [isDragOver, setIsDragOver] = useState(false);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(() => {
    try {
      const stored = sessionStorage.getItem('standiq_review_active_doc');
      if (stored && (stored.startsWith('uploaded-') || stored.startsWith('custom-'))) {
        const found = documents.find(d => d.id === stored);
        if (found?.auditSummary) return found.auditSummary;
      }
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  // Tab & viewer controls
  const [activeTab, setActiveTab] = useState<'extracted' | 'standards'>('extracted');
  const [currentPage, setCurrentPage] = useState(1);
  const [clausesPerPage, setClausesPerPage] = useState(5);
  const [reqPage, setReqPage] = useState(1);
  const [reqsPerPage, setReqsPerPage] = useState(5);
  const [zoom, setZoom] = useState(100);
  const [selectedClause, setSelectedClause] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  // Output export & feedback state
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Select an existing procurement to review
  const handleSelectExistingDoc = (doc: AnalyzedDocument) => {
    setActiveDocId(doc.id);
    setCurrentDoc(doc as any);
    setRequirements(doc.requirements || []);
    setRecommendedStandards(doc.recommendedStandards || []);
    setAuditSummary(doc.auditSummary || null);
    if (doc.rawTextContent) {
      setRawTextContent(doc.rawTextContent);
    }
    setUploadedFileType((doc as any).fileType || 'pdf');
    setUploadedBlobUrl(null);
    setViewerMode('document');
    setCurrentPage(1);
    setSelectedClause(null);
    setIsDocumentLoaded(true);
    try {
      sessionStorage.setItem('standiq_review_active_doc', doc.id);
    } catch (e) {
      console.warn('Could not set session storage:', e);
    }
  };

  // Close / Unload document and return to clean empty state
  const handleUnloadDocument = () => {
    try {
      sessionStorage.removeItem('standiq_review_active_doc');
    } catch (e) {
      console.warn('Could not remove session storage:', e);
    }
    setIsDocumentLoaded(false);
    setCurrentDoc(EMPTY_TENDER_DOC);
    setRequirements([]);
    setRecommendedStandards([]);
    setAuditSummary(null);
    setUploadedBlobUrl(null);
    setRawTextContent(null);
    setSelectedClause(null);
    setCurrentPage(1);
    setReqPage(1);
  };

  // Sync state whenever activeDocId changes in the global store, only when a real uploaded document is active
  useEffect(() => {
    if (activeDocument && isDocumentLoaded && (activeDocument.id.startsWith('uploaded-') || activeDocument.id.startsWith('custom-'))) {
      setCurrentDoc(activeDocument as any);
      setRequirements(activeDocument.requirements || []);
      setRecommendedStandards(activeDocument.recommendedStandards || []);
      setAuditSummary(activeDocument.auditSummary || null);
      if (activeDocument.rawTextContent) {
        setRawTextContent(activeDocument.rawTextContent);
      }
      if ((activeDocument as any).fileType) {
        setUploadedFileType((activeDocument as any).fileType);
      }
    }
  }, [activeDocId, activeDocument, isDocumentLoaded]);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [uploadModalTab, setUploadModalTab] = useState<'file' | 'text'>('file');
  const [inputSpecTitle, setInputSpecTitle] = useState('');
  const [inputSpecText, setInputSpecText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy output to clipboard
  const handleCopy = async (fmt: 'summary' | 'table' | 'spec' | 'json') => {
    const docToExport: AnalyzedDocument = {
      ...(currentDoc as any),
      requirements,
      recommendedStandards,
      basket,
      auditSummary: auditSummary || {
        pages: currentDoc.totalPages || 1,
        totalItems: requirements.length,
        mandatoryQcoItems: requirements.filter(r => r.severity === 'High').length,
        voluntaryItems: requirements.filter(r => r.severity !== 'High').length,
        complianceScore: 92,
        processingTimeSeconds: 1.2
      },
      category: (currentDoc as any).category || 'Industrial Equipment',
      uploadedAt: (currentDoc as any).uploadedAt || 'Today',
      status: (currentDoc as any).status || 'In Review',
      fileType: uploadedFileType
    };
    const success = await copyDocumentOutput(docToExport, fmt);
    setCopyMenuOpen(false);
    if (success) {
      showToast(`Copied ${fmt === 'spec' ? 'Tender Specification' : fmt === 'table' ? 'Requirements Table' : fmt === 'json' ? 'JSON' : 'Executive Summary'} to clipboard!`);
    }
  };

  // Convert and download official PDF
  const handleDownloadPdf = () => {
    setGeneratingPdf(true);
    try {
      const docToExport: AnalyzedDocument = {
        ...(currentDoc as any),
        requirements,
        recommendedStandards,
        basket,
        auditSummary: auditSummary || {
          pages: currentDoc.totalPages || 1,
          totalItems: requirements.length,
          mandatoryQcoItems: requirements.filter(r => r.severity === 'High').length,
          voluntaryItems: requirements.filter(r => r.severity !== 'High').length,
          complianceScore: 92,
          processingTimeSeconds: 1.2
        },
        category: (currentDoc as any).category || 'Industrial Equipment',
        uploadedAt: (currentDoc as any).uploadedAt || 'Today',
        status: (currentDoc as any).status || 'In Review',
        fileType: uploadedFileType
      };
      exportDocumentToPdf(docToExport, basket);
      showToast('Tender Compliance PDF generated & downloaded!');
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Submit direct specification text without file
  const handleDirectTextSubmit = () => {
    if (!inputSpecText.trim()) return;
    const title = inputSpecTitle.trim() || 'Custom_Tender_Specification';
    const textFile = new File([inputSpecText.trim()], `${title.replace(/\s+/g, '_')}.txt`, { type: 'text/plain' });
    processUploadedFile(textFile);
  };

  // Actions
  const handleAccept = (req: ExtractedRequirement) => {
    const updated = requirements.map(r => r.id === req.id ? { ...r, status: 'accepted' as const } : r);
    setRequirements(updated);
    updateDocumentRequirements(currentDoc.id, updated);

    if (req.recommendedStandard) {
      addToBasket({
        id: req.recommendedStandard,
        code: req.recommendedStandard,
        title: req.title,
        type: (req.category as BasketStandard['type']) || 'Product',
        status: 'Current'
      });
    }
  };

  const handleStandardToggle = (std: RecommendedStandardItem) => {
    if (isInBasket(std.code)) {
      removeFromBasket(std.code);
    } else {
      addToBasket({
        id: std.code,
        code: std.code,
        title: std.title,
        type: std.type,
        status: std.status
      });
    }
  };

  // Handle ANY file format upload (PDF, DOCX, XLSX, CSV, Images, TXT, etc.)
  const processUploadedFile = async (file: File) => {
    setUploading(true);
    setAnalysisStep(1);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fileCategory: 'pdf' | 'image' | 'text' | 'office' | 'other' = 'other';

    if (file.type === 'application/pdf' || ext === 'pdf') {
      fileCategory = 'pdf';
    } else if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'gif', 'svg'].includes(ext)) {
      fileCategory = 'image';
    } else if (file.type.startsWith('text/') || ['txt', 'csv', 'tsv', 'json', 'xml', 'md', 'rtf', 'log'].includes(ext)) {
      fileCategory = 'text';
    } else if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods'].includes(ext)) {
      fileCategory = 'office';
    }

    setUploadedFileType(fileCategory);

    // Read raw text if it's text-based
    let textContent = '';
    if (fileCategory === 'text') {
      try {
        textContent = await file.text();
        setRawTextContent(textContent);
      } catch (err) {
        console.warn('Could not read text content:', err);
      }
    } else {
      setRawTextContent(null);
    }

    // Create a local blob URL for real viewer display
    const objectUrl = URL.createObjectURL(file);
    setUploadedBlobUrl(objectUrl);
    
    // Default to preview mode for PDF, Image, and Text; document mode for others
    if (fileCategory === 'pdf' || fileCategory === 'image' || fileCategory === 'text') {
      setViewerMode('preview');
    } else {
      setViewerMode('document');
    }

    const stepTimer1 = setTimeout(() => setAnalysisStep(2), 400);
    const stepTimer2 = setTimeout(() => setAnalysisStep(3), 850);

    // Try calling backend /api/v1/recommend/document (or /pdf) for all supported document types
    let backendSuccess = false;
    const canSendToBackend = 
      fileCategory === 'pdf' || 
      fileCategory === 'image' || 
      fileCategory === 'office' || 
      fileCategory === 'text' || 
      ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'xlsx', 'xls', 'csv', 'txt'].includes(ext);

    if (canSendToBackend) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        let res = await fetch(`${API_BASE_URL}/api/v1/recommend/document?max_items=60&top_candidates=3`, {
          method: 'POST',
          body: formData,
        }).catch(() => null);

        // Fallback to /recommend/pdf if /recommend/document fails or 404
        if (!res || !res.ok) {
          const fallbackData = new FormData();
          fallbackData.append('file', file);
          res = await fetch(`${API_BASE_URL}/api/v1/recommend/pdf?max_items=60&top_candidates=3`, {
            method: 'POST',
            body: fallbackData,
          }).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data && data.item_recommendations && data.item_recommendations.length > 0) {
            backendSuccess = true;

            // Set real executive audit metrics
            if (data.compliance_summary) {
              setAuditSummary({
                pages: data.document_metadata?.pages || data.document_metadata?.total_rows || 1,
                totalItems: data.document_metadata?.total_items_extracted || data.item_recommendations.length,
                mandatoryQcoItems: data.compliance_summary.mandatory_qco_items || 0,
                voluntaryItems: data.compliance_summary.voluntary_items || 0,
                complianceScore: data.compliance_summary.compliance_score || 0,
                processingTimeSeconds: data.document_metadata?.processing_time_seconds || 0
              });
            }

            // Map backend items to requirements and standards
            const dynamicReqs: ExtractedRequirement[] = data.item_recommendations.map((item: any, idx: number) => ({
              id: idx + 1,
              title: item.primary_standard?.title_en 
                ? (item.primary_standard.title_en.length > 40 ? item.primary_standard.title_en.slice(0, 40) + '...' : item.primary_standard.title_en) 
                : (item.query_text ? item.query_text.slice(0, 36) + '...' : `Requirement #${idx + 1}`),
              severity: item.certification?.is_mandatory ? 'High' : 'Medium',
              requirementText: item.query_text || item.specification_clause || 'Extracted technical specification parameter.',
              recommendedStandard: item.primary_standard?.raw_id || item.primary_standard?.family_id || 'IS Standard',
              status: 'pending',
              clauseNumber: item.item_source || (item.page ? `Page ${item.page} (Item ${idx + 1})` : `Item ${idx + 1}`),
              category: item.category || item.archetype || 'Product',
              specificationGaps: item.specification_gaps || [],
              specificationClause: item.specification_clause || '',
              isMandatoryQco: !!item.certification?.is_mandatory,
              regulatoryStatus: item.certification?.regulatory_status || (item.certification?.is_mandatory ? 'MANDATORY' : 'NOT_VERIFIED'),
              qcoEvidence: item.certification?.evidence || item.certification?.applicable_qco,
              qcoEffectiveDate: item.certification?.effective_date,
              qcoScope: item.certification?.scope,
              qcoReason: item.certification?.reason
            }));

            const dynamicStds: RecommendedStandardItem[] = data.item_recommendations
              .filter((item: any) => item.primary_standard && item.primary_standard.family_id !== 'N/A')
              .map((item: any) => ({
                code: item.primary_standard.raw_id || item.primary_standard.family_id,
                title: item.primary_standard.title_en,
                match: item.primary_standard.confidence_label === 'HIGH' ? 96 : item.primary_standard.confidence_label === 'MEDIUM' ? 88 : 80,
                type: (item.primary_standard.type || 'Product') as BasketStandard['type'],
                status: (item.primary_standard.status === 'CURRENT' ? 'Current' : item.primary_standard.status === 'SUPERSEDED' ? 'Superseded' : 'Current') as BasketStandard['status'],
                rationale: item.certification?.is_mandatory 
                  ? `Legally mandatory under ${item.certification.evidence || item.certification.applicable_qco || 'BIS Quality Control Order (QCO)'}.` 
                  : 'Recommended baseline Indian Standard for quality compliance.',
                regulatoryStatus: item.certification?.regulatory_status || (item.certification?.is_mandatory ? 'MANDATORY' : 'NOT_VERIFIED'),
                qcoEvidence: item.certification?.evidence || item.certification?.applicable_qco,
                qcoEffectiveDate: item.certification?.effective_date,
                qcoScope: item.certification?.scope
              }));

            // Deduplicate standards
            const uniqueStds = Array.from(new Map(dynamicStds.map(s => [s.code, s])).values());

            const customDocData: TenderDocumentData = {
              id: 'custom-' + Date.now(),
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              totalPages: Number(data.document_metadata?.pages) || 1,
              department: 'CENTRAL PUBLIC PROCUREMENT PORTAL (GeM / CPPP)',
              tenderNumber: `CPPP/AI-EXTRACTED/${Date.now().toString().slice(-6)}`,
              title: `TENDER SPECIFICATION: ${file.name.replace(/\.[^/.]+$/, '').toUpperCase()}`,
              section: 'SECTION 1 — AI PARSED TECHNICAL REQUIREMENTS',
              clauses: dynamicReqs.map((req, i) => ({
                id: `c-dyn-${i+1}`,
                number: req.clauseNumber || `1.${i+1}`,
                title: req.title,
                text: req.requirementText,
                isHighlighted: true,
                highlightNote: req.isMandatoryQco ? 'Mandatory QCO Standard' : 'Recommended Indian Standard',
                matchedRequirementId: req.id,
                matchedStandard: req.recommendedStandard
              })),
              requirements: dynamicReqs,
              recommendedStandards: uniqueStds
            };

            const persistentDoc: AnalyzedDocument = {
              ...customDocData,
              category: 'Uploaded Tender',
              uploadedAt: 'Today',
              status: 'In Review',
              fileType: fileCategory,
              rawTextContent: textContent || null,
              basket: []
            };
            addOrUpdateDocument(persistentDoc);
            setActiveDocId(customDocData.id);

            setCurrentDoc(customDocData);
            setRequirements(dynamicReqs);
            setRecommendedStandards(customDocData.recommendedStandards);
            setCurrentPage(1);
            setReqPage(1);
            setIsDocumentLoaded(true);
            try {
              sessionStorage.setItem('standiq_review_active_doc', customDocData.id);
            } catch (e) {
              console.warn('Could not store session doc:', e);
            }
            showToast(`Ingested ${dynamicReqs.length} clauses from ${file.name}!`);
          }
        }
      } catch (err) {
        console.warn('Backend upload endpoint error, falling back to local extractor:', err);
      }
    }

    // Local extraction fallback if backend was unreachable or returned 0 items
    if (!backendSuccess) {
      const lines = textContent
        ? textContent.split('\n').map(l => l.trim()).filter(l => l.length > 15)
        : [];

      const customClauses: DocumentClause[] = lines.map((line, idx) => ({
        id: `c-text-${idx + 1}`,
        number: `1.${idx + 1}`,
        title: `Clause 1.${idx + 1}`,
        text: line,
        isHighlighted: false,
        matchedRequirementId: idx + 1
      }));

      const customReqs: ExtractedRequirement[] = lines.map((line, idx) => ({
        id: idx + 1,
        title: `Clause 1.${idx + 1}`,
        severity: 'Medium',
        requirementText: line,
        status: 'pending' as const,
        clauseNumber: `1.${idx + 1}`,
        category: 'Product'
      }));

      const customDocData: TenderDocumentData = {
        id: 'uploaded-' + Date.now(),
        fileName: file.name,
        fileSize: file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.round(file.size / 1024)} KB`,
        totalPages: 1,
        department: 'General Technical Specifications',
        tenderNumber: `TDR-${Date.now().toString().slice(-6)}`,
        title: `TENDER SPECIFICATION: ${file.name.replace(/\.[^/.]+$/, '').toUpperCase()}`,
        section: 'Technical Requirements',
        clauses: customClauses,
        requirements: customReqs,
        recommendedStandards: []
      };

      const persistentDoc: AnalyzedDocument = {
        ...customDocData,
        category: 'Uploaded Tender',
        uploadedAt: 'Today',
        status: 'In Review',
        fileType: fileCategory,
        rawTextContent: textContent || null,
        basket: []
      };
      addOrUpdateDocument(persistentDoc);
      setActiveDocId(customDocData.id);

      setCurrentDoc(customDocData);
      setRequirements(customReqs);
      setRecommendedStandards([]);
      setCurrentPage(1);
      setReqPage(1);
      setIsDocumentLoaded(true);
      try {
        sessionStorage.setItem('standiq_review_active_doc', customDocData.id);
      } catch (e) {
        console.warn('Could not store session doc:', e);
      }

      if (customClauses.length > 0) {
        showToast(`Document uploaded with ${customClauses.length} extracted text items.`);
      } else {
        showToast('Document uploaded. You can preview file contents.');
      }
    }

    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    setUploading(false);
    setIsUploadOpen(false);
  };

  const filteredRequirements = requirements.filter(req => {
    if (severityFilter === 'All') return true;
    return req.severity === severityFilter;
  });

  // Pagination for Document Clauses View
  const totalClauseCount = currentDoc.clauses?.length || 0;
  const totalClausePages = Math.max(1, Math.ceil(totalClauseCount / clausesPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalClausePages);
  const paginatedClauses = totalClauseCount === 0 
    ? [] 
    : currentDoc.clauses.slice((safeCurrentPage - 1) * clausesPerPage, safeCurrentPage * clausesPerPage);

  // Pagination for Extracted Requirements Tab
  const totalReqCount = filteredRequirements?.length || 0;
  const totalReqPages = Math.max(1, Math.ceil(totalReqCount / reqsPerPage));
  const safeReqPage = Math.min(Math.max(1, reqPage), totalReqPages);
  const paginatedRequirements = totalReqCount === 0 
    ? [] 
    : filteredRequirements.slice((safeReqPage - 1) * reqsPerPage, safeReqPage * reqsPerPage);

  // Label for the Preview Toggle button based on file type
  const getPreviewToggleLabel = () => {
    if (uploadedFileType === 'pdf') return 'Live PDF';
    if (uploadedFileType === 'image') return 'Live Image';
    if (uploadedFileType === 'text') return 'Raw Content';
    if (uploadedFileType === 'office') return 'File Card';
    return 'Live Preview';
  };

  // Auto-process file or selected document forwarded from other tabs
  useEffect(() => {
    if (location.state) {
      if ((location.state as any).autoUploadFile) {
        const fileToUpload = (location.state as any).autoUploadFile as File;
        processUploadedFile(fileToUpload);
        setIsDocumentLoaded(true);
      } else if ((location.state as any).selectedDocId) {
        const targetId = (location.state as any).selectedDocId;
        const targetDoc = documents.find(d => d.id === targetId);
        if (targetDoc) {
          handleSelectExistingDoc(targetDoc);
        } else {
          setActiveDocId(targetId);
          setIsDocumentLoaded(true);
          try {
            sessionStorage.setItem('standiq_review_active_doc', targetId);
          } catch (e) {
            console.warn('Could not store session doc:', e);
          }
        }
      }
    }
  }, [location.state, navigate]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Tender Specification Review</h1>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-mono px-2.5 py-0.5 rounded border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <FileCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Standards Verification Engine</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Inspect parsed clauses, evaluate requirement alignment against mandatory Bureau of Indian Standards (BIS) specifications, and verify compliance readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Copy Output Button with Dropdown (only when document is loaded) */}
          {isDocumentLoaded && (
            <div className="relative">
              <button
                onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0"
                title="Copy analysis output to clipboard"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Output</span>
              </button>

              {copyMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setCopyMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 font-mono">
                      Copy Format Options
                    </div>
                    <button
                      onClick={() => handleCopy('spec')}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 flex items-start gap-2.5 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Tender Specification</div>
                        <div className="text-[10px] text-slate-400">Ready for GeM / CPPP tender document</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleCopy('summary')}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 flex items-start gap-2.5 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Executive Compliance Summary</div>
                        <div className="text-[10px] text-slate-400">Score, QCO items, and applicable IS list</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleCopy('table')}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 flex items-start gap-2.5 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Requirements & Standards Table</div>
                        <div className="text-[10px] text-slate-400">Tabular markdown format</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleCopy('json')}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 flex items-start gap-2.5 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <FileCode2 className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Structured JSON</div>
                        <div className="text-[10px] text-slate-400">For ERP & procurement API integration</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Convert to PDF Button (only when document is loaded) */}
          {isDocumentLoaded && (
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0"
              title="Convert and export output to PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="whitespace-nowrap">{generatingPdf ? 'Generating...' : 'Convert to PDF'}</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Upload Document</span>
          </button>
        </div>
      </div>

      {/* Hidden file input for direct upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.docx,.doc,.xlsx,.xls,.csv,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processUploadedFile(file);
        }}
      />

      {!isDocumentLoaded ? (
        /* Empty State: Keep it clean, don't show anything randomly */
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
            <FileUp className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              No Tender Document Uploaded
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Upload a tender specification file or paste technical clauses to extract requirements, identify mandatory BIS standards (QCOs), and inspect compliance.
            </p>
          </div>

          {/* Drag & drop upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processUploadedFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 transition-colors ${
              isDragOver ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <Upload className="w-6 h-6 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Drag & drop your tender document here</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, Word, Excel, CSV, Images (PNG/JPG), and TXT</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File to Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalTab('text');
                    setIsUploadOpen(true);
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Paste Specification Text</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <>
          {/* Active Document Header Strip */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentDoc.fileName || currentDoc.title}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                    {currentDoc.fileSize}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  {currentDoc.department} • Ref: {currentDoc.tenderNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/basket')}
                className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <span>Document Basket ({basket.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleUnloadDocument}
                className="text-xs text-slate-600 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 border border-slate-200"
                title="Close document view"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Close Document</span>
              </button>
            </div>
          </div>

      {/* Minimalist Tender Audit Summary Card */}
      {auditSummary && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
              <span>Tender Audit Report</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{auditSummary.processingTimeSeconds}s Latency</span>
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentDoc.fileName}</span>
              <span className="text-xs font-normal font-mono text-slate-400">({currentDoc.fileSize})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Verified {auditSummary.totalItems} technical line items against BIS Quality Control Orders & National Standards.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-slate-50 rounded-md px-3.5 py-1.5 border border-slate-200 text-center min-w-[85px]">
              <div className="text-[10px] uppercase font-mono font-medium text-slate-500 tracking-wider">Compliance</div>
              <div className="text-base font-bold font-mono text-slate-900">{auditSummary.complianceScore}%</div>
            </div>
            <div className="bg-slate-50 rounded-md px-3.5 py-1.5 border border-slate-200 text-center min-w-[85px]">
              <div className="text-[10px] uppercase font-mono font-medium text-slate-500 tracking-wider">Mandatory QCO</div>
              <div className="text-base font-bold font-mono text-slate-900">{auditSummary.mandatoryQcoItems}</div>
            </div>
            <div className="bg-slate-50 rounded-md px-3.5 py-1.5 border border-slate-200 text-center min-w-[85px]">
              <div className="text-[10px] uppercase font-mono font-medium text-slate-500 tracking-wider">Voluntary IS</div>
              <div className="text-base font-bold font-mono text-slate-900">{auditSummary.voluntaryItems}</div>
            </div>
          </div>
        </div>
      )}

      {/* 02. Two Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Viewer (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          {/* Document Top Bar */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold font-mono truncate max-w-xs sm:max-w-md">
              {uploadedFileType === 'image' ? (
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : uploadedFileType === 'office' ? (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : uploadedFileType === 'text' ? (
                <FileCode2 className="w-4 h-4 text-indigo-600 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span className="truncate">{currentDoc.fileName}</span>
              <span className="text-[10px] text-slate-400 font-normal">({currentDoc.fileSize})</span>
            </div>

            {/* View Mode Toggle & Navigation Controls */}
            <div className="flex items-center gap-3">
              {uploadedBlobUrl && (
                <div className="flex items-center bg-slate-200/60 p-0.5 rounded-md text-[11px] font-medium">
                  <button
                    onClick={() => setViewerMode('preview')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      viewerMode === 'preview' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {getPreviewToggleLabel()}
                  </button>
                  <button
                    onClick={() => setViewerMode('document')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      viewerMode === 'document' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Extracted Clauses
                  </button>
                </div>
              )}

              {viewerMode === 'document' && (
                <>
                  <div className="flex items-center gap-1 text-slate-600">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={safeCurrentPage <= 1}
                      className="p-1 rounded hover:bg-slate-200/70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] px-1 font-semibold text-slate-700">
                      Page {safeCurrentPage} / {totalClausePages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalClausePages))}
                      disabled={safeCurrentPage >= totalClausePages}
                      className="p-1 rounded hover:bg-slate-200/70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 border-l border-slate-200 pl-2.5">
                    <button
                      onClick={() => setZoom(z => Math.max(z - 10, 60))}
                      className="p-1 rounded hover:bg-slate-200/70 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] w-9 text-center">{zoom}%</span>
                    <button
                      onClick={() => setZoom(z => Math.min(z + 10, 150))}
                      className="p-1 rounded hover:bg-slate-200/70 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rendered Document View */}
          <div className="p-4 sm:p-6 bg-white min-h-[580px] max-h-[680px] flex justify-center items-start overflow-auto">
            {uploadedBlobUrl && viewerMode === 'preview' ? (
              uploadedFileType === 'pdf' ? (
                /* PDF Viewer */
                <div className="w-full h-[600px] flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <iframe
                    src={uploadedBlobUrl}
                    title="Tender Document Viewer"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : uploadedFileType === 'image' ? (
                /* Scanned Document Image Viewer */
                <div className="w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-slate-900/5 rounded-lg overflow-auto">
                  <div className="mb-3 flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[11px] font-semibold px-3 py-1 rounded-full border border-blue-200">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scanned Image Document • RapidOCR Processed</span>
                  </div>
                  <img
                    src={uploadedBlobUrl}
                    alt="Uploaded Tender"
                    className="max-h-[500px] max-w-full object-contain rounded-md shadow-md border border-slate-200 bg-white transition-transform"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                  />
                </div>
              ) : uploadedFileType === 'text' ? (
                /* Raw Text / CSV Viewer */
                <div className="w-full h-full min-h-[580px] flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span className="font-semibold text-slate-800">Raw Text View ({currentDoc.fileName})</span>
                    <span>{rawTextContent?.split('\n').length || 0} lines ingested</span>
                  </div>
                  <pre 
                    className="p-4 text-xs font-mono text-slate-800 overflow-auto whitespace-pre-wrap leading-relaxed max-h-[540px] bg-slate-50/40"
                    style={{ fontSize: `${Math.round(12 * (zoom / 100))}px` }}
                  >
                    {rawTextContent || 'No raw text content available.'}
                  </pre>
                </div>
              ) : (
                /* Office / Binary Document Card */
                <div className="w-full h-full min-h-[580px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="font-bold text-slate-900 text-base">{currentDoc.fileName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{currentDoc.fileSize} • Ingested and indexed for standards verification</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-left text-xs max-w-sm w-full space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Document Parsing:</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Clauses Extracted:</span>
                      <span className="font-semibold text-blue-600">{requirements.length} Technical Requirements</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Standards Mapped:</span>
                      <span className="font-semibold text-emerald-600">{recommendedStandards.length} BIS Standards</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewerMode('document')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Extracted Clauses & Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            ) : (
              /* Structured Clause View (For all formats) */
              <div 
                className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 max-w-2xl w-full text-slate-800 space-y-5 text-xs leading-relaxed transition-transform rounded-lg min-h-full h-fit"
                style={{ transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined, transformOrigin: 'top center' }}
              >
                {/* Document Header */}
                <div className="border-b border-slate-200 pb-3 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">
                    {currentDoc.department}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    TENDER REF: <span className="font-bold text-slate-700">{currentDoc.tenderNumber}</span>
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-1">
                    {currentDoc.title}
                  </h2>
                  <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 mt-1">
                    {currentDoc.section}
                  </span>
                </div>

                {/* Clauses Header & Range Selector */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] text-slate-500">
                  <span className="font-medium">
                    Showing {totalClauseCount > 0 ? (safeCurrentPage - 1) * clausesPerPage + 1 : 0}–{Math.min(safeCurrentPage * clausesPerPage, totalClauseCount)} of {totalClauseCount} clauses
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Per page:</span>
                    {[5, 10, 20].map(cnt => (
                      <button
                        key={cnt}
                        onClick={() => { setClausesPerPage(cnt); setCurrentPage(1); }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          clausesPerPage === cnt ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clauses List */}
                <div className="space-y-4">
                  {paginatedClauses.map((clause) => {
                    const isSelected = selectedClause === clause.number;
                    return (
                      <div
                        key={clause.id}
                        onClick={() => setSelectedClause(clause.number)}
                        className={`space-y-1.5 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50/70 ring-2 ring-blue-500 shadow-xs' 
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-xs">
                            {clause.number} {clause.title}
                          </h3>
                          {clause.matchedStandard && (
                            <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {clause.matchedStandard}
                            </span>
                          )}
                        </div>

                        {clause.isHighlighted ? (
                          <div className="bg-amber-100/80 border-l-4 border-amber-500 p-3 rounded-r-md text-slate-900 font-medium shadow-2xs">
                            <p className="text-xs leading-relaxed">{clause.text}</p>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-amber-800 font-mono">
                              <span className="font-bold flex items-center gap-1">
                                <FileCheck2 className="w-3 h-3 text-amber-600" />
                                <span>{clause.highlightNote || 'Extracted Parameter'}</span>
                              </span>
                              <span className="font-semibold text-blue-700">
                                {clause.matchedStandard ? `Matches ${clause.matchedStandard}` : 'Verified Parameter'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-600 text-xs leading-relaxed pl-1">
                            {clause.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Document Footer with Numbered Pagination */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                      Page {safeCurrentPage} of {totalClausePages} ({totalClauseCount} clauses total)
                    </span>

                    {totalClausePages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={safeCurrentPage <= 1}
                          className="px-2 py-1 rounded-md text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-slate-700"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>Prev</span>
                        </button>

                        {Array.from({ length: totalClausePages }, (_, i) => i + 1).map(pageNum => {
                          if (totalClausePages > 7 && Math.abs(pageNum - safeCurrentPage) > 2 && pageNum !== 1 && pageNum !== totalClausePages) {
                            if (pageNum === 2 || pageNum === totalClausePages - 1) {
                              return <span key={pageNum} className="px-1 text-slate-400 text-xs">...</span>;
                            }
                            return null;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-6 h-6 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                                safeCurrentPage === pageNum
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalClausePages))}
                          disabled={safeCurrentPage >= totalClausePages}
                          className="px-2 py-1 rounded-md text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-slate-700"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar Indicator */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Document loaded: {currentDoc.fileName}</span>
            </span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Change Document</span>
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Extracted Requirements & Recommended Standards (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('extracted')}
              className={`flex-1 py-3 px-4 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'extracted'
                  ? 'border-blue-600 text-blue-600 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Extracted Requirements</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {requirements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('standards')}
              className={`flex-1 py-3 px-4 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'standards'
                  ? 'border-blue-600 text-blue-600 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Recommended Standards</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {recommendedStandards.length}
              </span>
            </button>
          </div>

          {/* Filter Bar for Extracted Requirements */}
          {activeTab === 'extracted' && (
            <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between text-[11px] flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  <span>Severity:</span>
                </div>
                <div className="flex items-center gap-1">
                  {(['All', 'High', 'Medium', 'Low'] as const).map(sev => (
                    <button
                      key={sev}
                      onClick={() => { setSeverityFilter(sev); setReqPage(1); }}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                        severityFilter === sev
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-page selector & item range */}
              <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalReqCount > 0 ? (safeReqPage - 1) * reqsPerPage + 1 : 0}–{Math.min(safeReqPage * reqsPerPage, totalReqCount)} of {totalReqCount}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Per page:</span>
                  {[5, 10, 20].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => { setReqsPerPage(cnt); setReqPage(1); }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                        reqsPerPage === cnt ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cards List */}
          <div className="p-4 space-y-3.5 max-h-[560px] overflow-y-auto">
            {activeTab === 'extracted' ? (
              filteredRequirements.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No requirements match the selected filter.
                </div>
              ) : (
                paginatedRequirements.map((req) => {
                  const isClauseActive = selectedClause === req.clauseNumber;
                  const isAccepted = req.status === 'accepted' || (req.recommendedStandard ? isInBasket(req.recommendedStandard) : false);

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedClause(req.clauseNumber || null)}
                      className={`p-4 rounded-xl border shadow-2xs space-y-2.5 transition-all cursor-pointer ${
                        isClauseActive
                          ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-400'
                          : 'border-slate-200/90 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center">
                            {req.id}
                          </span>
                          <h3 className="font-bold text-slate-900 text-xs">{req.title}</h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {req.clauseNumber && (
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">
                              Clause {req.clauseNumber}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              req.severity === 'High'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : req.severity === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {req.severity}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs pl-7 leading-relaxed font-medium">
                        {req.requirementText}
                      </p>

                      {/* Missing Parameters / Gaps Identified by AI Engine */}
                      {req.specificationGaps && req.specificationGaps.length > 0 && (
                        <div className="ml-7 bg-amber-50 border border-amber-200/80 rounded-lg p-2 text-[11px] text-amber-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-amber-800 text-[10px] uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>Specification Gaps in Tender:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-amber-800/90 pl-1 font-medium">
                            {req.specificationGaps.map((gap, gIdx) => (
                              <li key={gIdx}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Generated Harmonized Specification Clause */}
                      {req.specificationClause && (
                        <div className="ml-7 bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-2.5 text-[11px] space-y-1">
                          <div className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Drafted BIS Tender Clause:</span>
                          </div>
                          <p className="text-[11px] text-emerald-950 font-mono leading-relaxed bg-white/80 p-2 rounded border border-emerald-100/80">
                            {req.specificationClause}
                          </p>
                        </div>
                      )}

                      {req.recommendedStandard && (
                        <div className="pl-7 pt-1 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-400">Standard:</span>
                            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                              {req.recommendedStandard}
                            </span>
                            {req.regulatoryStatus === 'MANDATORY' || req.isMandatoryQco ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                                  <span>MANDATORY QCO</span>
                                  {req.qcoEffectiveDate && <span className="text-[9px] font-normal text-amber-700 font-mono">({req.qcoEffectiveDate})</span>}
                                </span>
                                {req.qcoEvidence && (
                                  <span className="text-[10px] text-slate-500 font-medium max-w-xs truncate" title={req.qcoEvidence}>
                                    Order: {req.qcoEvidence}
                                  </span>
                                )}
                              </div>
                            ) : req.regulatoryStatus === 'EXEMPTED_OR_DENOTIFIED' ? (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                                Exempted / De-Notified
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200" title={req.qcoReason || "No current QCO evidence found for this exact product/IS combination"}>
                                Regulatory: NOT VERIFIED
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAccept(req)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isAccepted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                            }`}
                          >
                            {isAccepted ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Accepted</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Add to Basket</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              /* Recommended Standards Tab View */
              recommendedStandards.map((std) => {
                const inBasket = isInBasket(std.code);
                return (
                  <div
                    key={std.code}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-blue-200 shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{std.code}</span>
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {std.type}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {std.match}% Match
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">{std.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{std.rationale}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => navigate('/graph')}
                        className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>View in Graph</span>
                      </button>

                      <button
                        onClick={() => handleStandardToggle(std)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          inBasket
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        }`}
                      >
                        {inBasket ? (
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
                  </div>
                );
              })
            )}
          </div>

          {/* Extracted Requirements Pagination Bar */}
          {activeTab === 'extracted' && totalReqPages > 1 && (
            <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                Page <span className="font-bold text-slate-800">{safeReqPage}</span> of {totalReqPages} ({totalReqCount} requirements)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setReqPage(p => Math.max(p - 1, 1))}
                  disabled={safeReqPage <= 1}
                  className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[11px] font-semibold text-slate-700 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: totalReqPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setReqPage(page)}
                      className={`min-w-6 h-6 px-1.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                        safeReqPage === page
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReqPage(p => Math.min(p + 1, totalReqPages))}
                  disabled={safeReqPage >= totalReqPages}
                  className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[11px] font-semibold text-slate-700 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                  title="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 mt-auto flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {activeTab === 'extracted' 
                ? `${requirements.length} clauses parsed against BIS repository` 
                : 'Standards verified against Bureau of Indian Standards'}
            </span>
            <button
              onClick={() => navigate('/basket')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Standards Basket</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Upload Tender Document Modal - Clean & Simple */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-sm">Upload Tender Document</h2>
              </div>
              {!uploading && (
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Segmented Mode Selector */}
            {!uploading && (
              <div className="px-5 pt-3.5">
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setUploadModalTab('file')}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                      uploadModalTab === 'file' 
                        ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadModalTab('text')}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                      uploadModalTab === 'text' 
                        ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Text</span>
                  </button>
                </div>
              </div>
            )}

            <div className="p-5">
              {uploading ? (
                /* Processing State */
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <ShieldCheck className="w-4 h-4 text-blue-600 absolute inset-0 m-auto" />
                  </div>
                  
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Processing Tender Document...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Extracting clauses and cross-referencing BIS standards
                    </p>
                  </div>

                  <div className="w-44 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(analysisStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ) : uploadModalTab === 'text' ? (
                /* Direct Text Mode */
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tender Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={inputSpecTitle}
                      onChange={(e) => setInputSpecTitle(e.target.value)}
                      placeholder="e.g. Technical Specification Schedule"
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Specification Clauses <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={inputSpecText}
                      onChange={(e) => setInputSpecText(e.target.value)}
                      placeholder="Paste tender specifications, requirements, or BoQ clauses here..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 leading-relaxed bg-white font-sans"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!inputSpecText.trim()}
                      onClick={handleDirectTextSubmit}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        inputSpecText.trim()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      Analyze Clauses
                    </button>
                  </div>
                </div>
              ) : (
                /* File Dropzone Mode */
                <label 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processUploadedFile(file);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop tender
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    PDF, DOCX, Images, CSV, or TXT (up to 50 MB)
                  </span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.docx,.doc,.xlsx,.xls,.csv,.txt"
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processUploadedFile(file);
                    }} 
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
