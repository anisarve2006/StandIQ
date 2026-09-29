import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BasketStandard {
  id: string; // e.g. "IS 12615:2018"
  code: string; // "IS 12615:2018"
  title: string;
  type: 'Product' | 'Testing' | 'Safety' | 'Installation' | 'Terminology' | 'Code of Practice';
  status: 'Current' | 'Under Review' | 'Superseded' | 'Withdrawn';
  year?: number;
  reaffirmedYear?: number;
  relatedCount?: number;
  tags?: string[];
  mandatory?: boolean;
  rationale?: string;
  match?: number;
}

export interface DocumentClause {
  id: string;
  number: string;
  title: string;
  text: string;
  isHighlighted?: boolean;
  highlightNote?: string;
  matchedRequirementId?: number;
  matchedStandard?: string;
}

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
}

export interface RecommendedStandardItem {
  code: string;
  title: string;
  match: number;
  type: BasketStandard['type'];
  status: BasketStandard['status'];
  rationale: string;
}

export interface AuditSummary {
  pages: number | string;
  totalItems: number;
  mandatoryQcoItems: number;
  voluntaryItems: number;
  complianceScore: number;
  processingTimeSeconds: number;
}

export interface AnalyzedDocument {
  id: string;
  fileName: string;
  fileSize: string;
  totalPages: number;
  department: string;
  tenderNumber: string;
  title: string;
  section: string;
  category: string;
  uploadedAt: string;
  status: 'In Review' | 'Completed' | 'Ready' | 'Draft';
  fileType: 'pdf' | 'image' | 'text' | 'office' | 'other';
  rawTextContent?: string | null;
  clauses: DocumentClause[];
  requirements: ExtractedRequirement[];
  recommendedStandards: RecommendedStandardItem[];
  auditSummary?: AuditSummary;
  basket: BasketStandard[];
}

export interface ProcurementDraft {
  mode: 'describe' | 'upload';
  description: string;
  technicalSpec: string;
  application: string;
  environment: string;
  existingStandards: string;
  language: string;
  fileName: string | null;
  fileSize: string | null;
}

export const INITIAL_PROCUREMENT_DRAFT: ProcurementDraft = {
  mode: 'describe',
  description: '',
  technicalSpec: '',
  application: '',
  environment: '',
  existingStandards: '',
  language: 'auto',
  fileName: null,
  fileSize: null,
};

// Clean initial state with no mock documents
export const INITIAL_DOCUMENTS: AnalyzedDocument[] = [];

export const EMPTY_DOCUMENT: AnalyzedDocument = {
  id: '',
  fileName: '',
  fileSize: '',
  totalPages: 0,
  department: '',
  tenderNumber: '',
  title: '',
  section: '',
  category: '',
  uploadedAt: '',
  status: 'Draft',
  fileType: 'pdf',
  clauses: [],
  requirements: [],
  recommendedStandards: [],
  basket: [],
  auditSummary: {
    pages: 0,
    totalItems: 0,
    mandatoryQcoItems: 0,
    voluntaryItems: 0,
    complianceScore: 0,
    processingTimeSeconds: 0,
  }
};

export type LanguageCode = 'English' | 'Hindi' | 'Marathi' | 'Tamil' | 'Gujarati';
export type DateFormatCode = 'DD MMM YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY';
export type ThemeCode = 'Soothing' | 'Light' | 'Dark' | 'System';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  English: {
    dashboard: 'Dashboard',
    procurements: 'Procurements',
    standards: 'Standards',
    tenderHealth: 'Tender Health',
    knowledgeGraph: 'Knowledge Graph',
    review: 'Review',
    standardsBasket: 'Standards Basket',
    specificationBuilder: 'Specification Builder',
    approval: 'Approval',
    export: 'Export',
    changesAlerts: 'Changes & Alerts',
    settings: 'Settings',
    goodMorning: 'Good morning',
    heroSubtitle: 'From procurement requirements to compliant specifications.',
    newAnalysis: 'New Analysis',
    exploreStandards: 'Explore Standards',
    searchPlaceholder: 'Search standards, procurements, requirements...',
    saveChanges: 'Save Changes',
    savedChanges: 'Saved Changes!',
    recentAnalyses: 'Recent Analyses',
    standardsIdentified: 'Standards Identified',
    analysesCompleted: 'Analyses Completed',
    avgMatchConfidence: 'Average Match Confidence',
    departmentsUsing: 'Departments Using',
    title: 'Title',
    category: 'Category',
    matchConfidence: 'Match Confidence',
    status: 'Status',
    updated: 'Updated',
    actions: 'Actions',
    completed: 'Completed',
    inReview: 'In Review',
    draft: 'Draft',
    ready: 'Ready',
    viewAll: 'View All',
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    procurements: 'खरीद प्रबंधन',
    standards: 'भारतीय मानक',
    tenderHealth: 'निविदा स्वास्थ्य',
    knowledgeGraph: 'ज्ञान ग्राफ',
    review: 'समीक्षा एवं सत्यापन',
    standardsBasket: 'मानक बास्केट',
    specificationBuilder: 'विनिर्देश निर्माता',
    approval: 'अनुमोदन वर्कफ़्लो',
    export: 'निर्यात पैकेज',
    changesAlerts: 'परिवर्तन एवं अलर्ट',
    settings: 'सेटिंग्स',
    goodMorning: 'शुभ प्रभात',
    heroSubtitle: 'खरीद आवश्यकताओं से लेकर अनुपालन विनिर्देशों तक।',
    newAnalysis: 'नया विश्लेषण',
    exploreStandards: 'मानक खोजें',
    searchPlaceholder: 'मानक, खरीद, आवश्यकताएं खोजें...',
    saveChanges: 'परिवर्तन सहेजें',
    savedChanges: 'सफलतापूर्वक सहेजा गया!',
    recentAnalyses: 'हालिया विश्लेषण',
    standardsIdentified: 'पहचाने गए मानक',
    analysesCompleted: 'पूर्ण विश्लेषण',
    avgMatchConfidence: 'औसत मैच विश्वास',
    departmentsUsing: 'सक्रिय विभाग',
    title: 'शीर्षक',
    category: 'श्रेणी',
    matchConfidence: 'मैच विश्वास',
    status: 'स्थिति',
    updated: 'अद्यतित',
    actions: 'कार्रवाई',
    completed: 'पूर्ण',
    inReview: 'समीक्षाधीन',
    draft: 'प्रारूप',
    ready: 'तैयार',
    viewAll: 'सभी देखें',
  },
  Marathi: {
    dashboard: 'डॅशबोर्ड',
    procurements: 'खरेदी व्यवस्थापन',
    standards: 'भारतीय मानके',
    tenderHealth: 'निविदा आरोग्य',
    knowledgeGraph: 'ज्ञान आलेख',
    review: 'पुनरावलोकन',
    standardsBasket: 'मानके बास्केट',
    specificationBuilder: 'विनिर्देश बिल्डर',
    approval: 'मंजुरी वर्कफ्लो',
    export: 'निर्यात पॅकेज',
    changesAlerts: 'बदल आणि अलर्ट',
    settings: 'सेटिंग्ज',
    goodMorning: 'शुभ सकाळ',
    heroSubtitle: 'खरेदी गरजांपासून ते अनुपालन विनिर्देशांपर्यंत.',
    newAnalysis: 'नवीन विश्लेषण',
    exploreStandards: 'मानके शोधा',
    searchPlaceholder: 'मानके, खरेदी, आवश्यकता शोधा...',
    saveChanges: 'बदल जतन करा',
    savedChanges: 'यशस्वीरीत्या जतन केले!',
    recentAnalyses: 'अलीकडील विश्लेषण',
    standardsIdentified: 'ओळखलेली मानके',
    analysesCompleted: 'पूर्ण झालेले विश्लेषण',
    avgMatchConfidence: 'सरासरी मॅच विश्वास',
    departmentsUsing: 'वापरणारे विभाग',
    title: 'शीर्षक',
    category: 'प्रवर्ग',
    matchConfidence: 'मॅच विश्वास',
    status: 'स्थिती',
    updated: 'अद्यतनित',
    actions: 'कृती',
    completed: 'पूर्ण',
    inReview: 'पुनरावलोकनात',
    draft: 'मसुदा',
    ready: 'तयार',
    viewAll: 'सर्व पहा',
  },
  Tamil: {
    dashboard: 'டாஷ்போர்டு',
    procurements: 'கொள்முதல்',
    standards: 'தரநிலைகள்',
    tenderHealth: 'டெண்டர் நிலை',
    knowledgeGraph: 'அறிவு வரைபடம்',
    review: 'மதிப்பாய்வு',
    standardsBasket: 'தரநிலைக் கூடை',
    specificationBuilder: 'விவரக்குறிப்பு உருவாக்கி',
    approval: 'ஒப்புதல் செயல்முறை',
    export: 'ஏற்றுமதி',
    changesAlerts: 'மாற்றங்கள் & எச்சரிக்கைகள்',
    settings: 'அமைப்புகள்',
    goodMorning: 'காலை வணக்கம்',
    heroSubtitle: 'கொள்முதல் தேவைகளில் இருந்து இணக்கமான விவரக்குறிப்புகள் வரை.',
    newAnalysis: 'புதிய பகுப்பாய்வு',
    exploreStandards: 'தரநிலைகளை ஆராய்க',
    searchPlaceholder: 'தரநிலைகள், கொள்முதலைத் தேடுங்கள்...',
    saveChanges: 'மாற்றங்களைச் சேமிக்கவும்',
    savedChanges: 'வெற்றிகரமாகச் சேமிக்கப்பட்டது!',
    recentAnalyses: 'சமீபத்திய பகுப்பாய்வு',
    standardsIdentified: 'அடையாளம் காணப்பட்ட தரநிலைகள்',
    analysesCompleted: 'முடிக்கப்பட்ட பகுப்பாய்வு',
    avgMatchConfidence: 'சராசரி பொருத்த நம்பிக்கை',
    departmentsUsing: 'பயன்படுத்தும் துறைகள்',
    title: 'தலைப்பு',
    category: 'வகை',
    matchConfidence: 'பொருத்த நம்பிக்கை',
    status: 'நிலை',
    updated: 'புதுப்பிக்கப்பட்டது',
    actions: 'செயல்கள்',
    completed: 'முடிந்தது',
    inReview: 'மதிப்பாய்வில்',
    draft: 'வரைவு',
    ready: 'தயார்',
    viewAll: 'அனைத்தையும் பார்க்க',
  },
  Gujarati: {
    dashboard: 'ડેશબોર્ડ',
    procurements: 'પ્રાપ્તિ વ્યવસ્થાપન',
    standards: 'ભારતીય ધોરણો',
    tenderHealth: 'ટેન્ડર સ્થિતિ',
    knowledgeGraph: 'નોલેજ ગ્રાફ',
    review: 'સમીક્ષા અને ચકાસણી',
    standardsBasket: 'ધોરણો બાસ્કેટ',
    specificationBuilder: 'વિશિષ્ટતા બિલ્ડર',
    approval: 'મંજૂરી વર્કફ્લો',
    export: 'નિકાસ પેકેજ',
    changesAlerts: 'ફેરફારો અને ચેતવણીઓ',
    settings: 'સેટિંગ્સ',
    goodMorning: 'શુભ સવાર',
    heroSubtitle: 'પ્રાપ્તિ જરૂરિયાતોથી સુસંગત વિશિષ્ટતાઓ સુધી.',
    newAnalysis: 'નવું વિશ્લેષણ',
    exploreStandards: 'ધોરણોનું અન્વેષણ કરો',
    searchPlaceholder: 'ધોરણો, પ્રાપ્તિ શોધો...',
    saveChanges: 'ફેરફારો સાચવો',
    savedChanges: 'સફળતાપૂર્વક સાચવવામાં આવ્યું!',
    recentAnalyses: 'તાજેતરના વિશ્લેષણ',
    standardsIdentified: 'ઓળખાયેલ ધોરણો',
    analysesCompleted: 'વિશ્લેષણ પૂર્ણ',
    avgMatchConfidence: 'સરેરાશ મેળ વિશ્વાસ',
    departmentsUsing: 'ઉપયોગ કરતા વિભાગો',
    title: 'શીર્ષક',
    category: 'શ્રેણી',
    matchConfidence: 'મેળ વિશ્વાસ',
    status: 'સ્થિતિ',
    updated: 'અપડેટ કર્યું',
    actions: 'ક્રિયાઓ',
    completed: 'પૂર્ણ',
    inReview: 'સમીક્ષા હેઠળ',
    draft: 'ડ્રાફ્ટ',
    ready: 'તૈયાર',
    viewAll: 'બધું જુઓ',
  },
};

export function formatWithTemplate(dateStr: string, template: DateFormatCode): string {
  if (!dateStr) return '';

  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  const parts = dateStr.trim().split(/[\s-]+/);
  let day = '24';
  let month = '09';
  let monthName = 'Sep';
  let year = '2026';

  if (parts.length >= 3) {
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthName = monthNames[parseInt(month, 10)] || 'Sep';
    } else {
      day = parts[0].padStart(2, '0');
      if (months[parts[1]]) {
        monthName = parts[1];
        month = months[parts[1]];
      } else {
        month = parts[1].padStart(2, '0');
      }
      year = parts[2];
    }
  }

  if (template === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (template === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  return `${day} ${monthName} ${year}`;
}

interface StandIQContextType {
  // Global & Per-Document Baskets
  basket: BasketStandard[];
  addToBasket: (standard: BasketStandard) => void;
  removeFromBasket: (id: string) => void;
  isInBasket: (id: string) => boolean;
  clearBasket: () => void;

  // Dedicated Per-Document Basket Operations
  documentBaskets: Record<string, BasketStandard[]>;
  getDocumentBasket: (docId: string) => BasketStandard[];
  addToDocumentBasket: (docId: string, standard: BasketStandard) => void;
  removeFromDocumentBasket: (docId: string, standardId: string) => void;
  isInDocumentBasket: (docId: string, standardId: string) => boolean;
  clearDocumentBasket: (docId: string) => void;

  // Documents & Output State
  documents: AnalyzedDocument[];
  activeDocId: string;
  activeDocument: AnalyzedDocument;
  setActiveDocId: (id: string) => void;
  addOrUpdateDocument: (doc: Partial<AnalyzedDocument> & { id: string; title: string }) => void;
  deleteDocument: (id: string) => void;
  updateDocumentRequirements: (docId: string, reqs: ExtractedRequirement[]) => void;
  updateDocumentStandards: (docId: string, stds: RecommendedStandardItem[]) => void;

  // Persistent Input Draft (New Procurement)
  procurementDraft: ProcurementDraft;
  setProcurementDraft: React.Dispatch<React.SetStateAction<ProcurementDraft>>;
  resetProcurementDraft: () => void;

  // User & Settings
  user: {
    name: string;
    initials: string;
    email: string;
    role: string;
    department: string;
  };
  unreadAlertsCount: number;
  markAlertsAsRead: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: ThemeCode;
  setTheme: (th: ThemeCode) => void;
  dateFormat: DateFormatCode;
  setDateFormat: (fmt: DateFormatCode) => void;
  formatDate: (dateStr: string) => string;
  t: (key: string) => string;
}

const StandIQContext = createContext<StandIQContextType | undefined>(undefined);

export function StandIQProvider({ children }: { children: React.ReactNode }) {
  // 1. Documents State (persisted across tabs & reloads)
  const [documents, setDocuments] = useState<AnalyzedDocument[]>(() => {
    try {
      const stored = localStorage.getItem('standiq_documents_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out legacy demo seed IDs so fake data doesn't persist
          const realDocs = parsed.filter(d => !['motors', 'cables', 'tmt-steel', 'solar', 'pumps'].includes(d.id));
          return realDocs;
        }
      }
    } catch (e) {
      console.warn('Error reading stored documents:', e);
    }
    return [];
  });

  // 2. Active Document ID
  const [activeDocId, setActiveDocIdState] = useState<string>(() => {
    const stored = localStorage.getItem('standiq_active_doc_id');
    if (stored && ['motors', 'cables', 'tmt-steel', 'solar', 'pumps'].includes(stored)) {
      localStorage.removeItem('standiq_active_doc_id');
      return '';
    }
    return stored || '';
  });

  // 3. Document Baskets State (Record<docId, BasketStandard[]>)
  const [documentBaskets, setDocumentBaskets] = useState<Record<string, BasketStandard[]>>(() => {
    try {
      const stored = localStorage.getItem('standiq_document_baskets_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleanBaskets: Record<string, BasketStandard[]> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (!['motors', 'cables', 'tmt-steel', 'solar', 'pumps'].includes(k)) {
            cleanBaskets[k] = v as BasketStandard[];
          }
        }
        return cleanBaskets;
      }
    } catch (e) {
      console.warn('Error reading stored document baskets:', e);
    }
    return {};
  });

  // 4. Procurement Input Draft State
  const [procurementDraft, setProcurementDraft] = useState<ProcurementDraft>(() => {
    try {
      const stored = localStorage.getItem('standiq_procurement_draft');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading procurement draft:', e);
    }
    return INITIAL_PROCUREMENT_DRAFT;
  });

  // Save documents to localStorage
  useEffect(() => {
    try {
      const cleanDocs = documents.map(d => ({
        ...d,
        rawTextContent: d.rawTextContent ? d.rawTextContent.slice(0, 15000) : null
      }));
      localStorage.setItem('standiq_documents_v2', JSON.stringify(cleanDocs));
    } catch (err) {
      console.warn('Could not persist documents to localStorage:', err);
    }
  }, [documents]);

  // Save active document ID to localStorage
  useEffect(() => {
    localStorage.setItem('standiq_active_doc_id', activeDocId);
  }, [activeDocId]);

  // Save document baskets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('standiq_document_baskets_v2', JSON.stringify(documentBaskets));
    } catch (err) {
      console.warn('Could not persist document baskets to localStorage:', err);
    }
  }, [documentBaskets]);

  // Save procurement draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('standiq_procurement_draft', JSON.stringify(procurementDraft));
    } catch (err) {
      console.warn('Could not persist procurement draft:', err);
    }
  }, [procurementDraft]);

  // Active document object
  const activeDocument: AnalyzedDocument = documents.find(d => d.id === activeDocId) || documents[0] || EMPTY_DOCUMENT;

  const setActiveDocId = (id: string) => {
    setActiveDocIdState(id);
  };

  // Add or update document in store
  const addOrUpdateDocument = (docUpdate: Partial<AnalyzedDocument> & { id: string; title: string }) => {
    setDocuments(prev => {
      const existsIndex = prev.findIndex(d => d.id === docUpdate.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...docUpdate } as AnalyzedDocument;
        return updated;
      } else {
        const newDoc: AnalyzedDocument = {
          fileName: docUpdate.fileName || `${docUpdate.title.replace(/\s+/g, '_')}.pdf`,
          fileSize: docUpdate.fileSize || '1.5 MB',
          totalPages: docUpdate.totalPages || 1,
          department: docUpdate.department || 'CENTRAL PUBLIC PROCUREMENT PORTAL',
          tenderNumber: docUpdate.tenderNumber || `TDR/AI/${Date.now().toString().slice(-6)}`,
          section: docUpdate.section || 'SECTION 1 — TECHNICAL REQUIREMENTS',
          category: docUpdate.category || 'General Procurement',
          uploadedAt: docUpdate.uploadedAt || 'Today',
          status: docUpdate.status || 'In Review',
          fileType: docUpdate.fileType || 'pdf',
          clauses: docUpdate.clauses || [],
          requirements: docUpdate.requirements || [],
          recommendedStandards: docUpdate.recommendedStandards || [],
          auditSummary: docUpdate.auditSummary || {
            pages: docUpdate.totalPages || 1,
            totalItems: docUpdate.requirements?.length || 0,
            mandatoryQcoItems: docUpdate.requirements?.filter(r => r.severity === 'High').length || 0,
            voluntaryItems: docUpdate.requirements?.filter(r => r.severity !== 'High').length || 0,
            complianceScore: 92,
            processingTimeSeconds: 1.2
          },
          basket: docUpdate.basket || [],
          ...docUpdate
        } as AnalyzedDocument;
        return [newDoc, ...prev];
      }
    });

    // Ensure document basket exists
    if (docUpdate.basket) {
      setDocumentBaskets(prev => ({
        ...prev,
        [docUpdate.id]: docUpdate.basket!
      }));
    } else if (!documentBaskets[docUpdate.id]) {
      setDocumentBaskets(prev => ({
        ...prev,
        [docUpdate.id]: []
      }));
    }

    setActiveDocIdState(docUpdate.id);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    setDocumentBaskets(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (activeDocId === id) {
      const remaining = documents.filter(d => d.id !== id);
      if (remaining.length > 0) {
        setActiveDocIdState(remaining[0].id);
      }
    }
  };

  const updateDocumentRequirements = (docId: string, reqs: ExtractedRequirement[]) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, requirements: reqs } : d));
  };

  const updateDocumentStandards = (docId: string, stds: RecommendedStandardItem[]) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, recommendedStandards: stds } : d));
  };

  // Dedicated Per-Document Basket Operations
  const getDocumentBasket = (docId: string): BasketStandard[] => {
    return documentBaskets[docId] || [];
  };

  const addToDocumentBasket = (docId: string, standard: BasketStandard) => {
    setDocumentBaskets(prev => {
      const current = prev[docId] || [];
      if (current.some(s => s.id === standard.id || s.code === standard.code)) {
        return prev;
      }
      const updated = [...current, standard];
      // Keep doc.basket in sync as well
      setDocuments(docList => docList.map(d => d.id === docId ? { ...d, basket: updated } : d));
      return { ...prev, [docId]: updated };
    });
  };

  const removeFromDocumentBasket = (docId: string, standardId: string) => {
    setDocumentBaskets(prev => {
      const current = prev[docId] || [];
      const updated = current.filter(s => s.id !== standardId && s.code !== standardId);
      setDocuments(docList => docList.map(d => d.id === docId ? { ...d, basket: updated } : d));
      return { ...prev, [docId]: updated };
    });
  };

  const isInDocumentBasket = (docId: string, standardId: string): boolean => {
    const list = documentBaskets[docId] || [];
    return list.some(s => s.id === standardId || s.code === standardId);
  };

  const clearDocumentBasket = (docId: string) => {
    setDocumentBaskets(prev => ({ ...prev, [docId]: [] }));
    setDocuments(docList => docList.map(d => d.id === docId ? { ...d, basket: [] } : d));
  };

  // Active Document Basket Convenience Methods (backwards-compatible)
  const basket = getDocumentBasket(activeDocId);

  const addToBasket = (standard: BasketStandard) => {
    addToDocumentBasket(activeDocId, standard);
  };

  const removeFromBasket = (id: string) => {
    removeFromDocumentBasket(activeDocId, id);
  };

  const isInBasket = (id: string) => {
    return isInDocumentBasket(activeDocId, id);
  };

  const clearBasket = () => {
    clearDocumentBasket(activeDocId);
  };

  const resetProcurementDraft = () => {
    setProcurementDraft(INITIAL_PROCUREMENT_DRAFT);
  };

  // Preference states
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(12);

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('standiq-lang') as LanguageCode) || 'English';
  });

  const [theme, setThemeState] = useState<ThemeCode>(() => {
    const stored = localStorage.getItem('maanakai-theme');
    if (!stored) return 'Soothing';
    const cap = (stored.charAt(0).toUpperCase() + stored.slice(1)) as ThemeCode;
    if (cap === 'Soothing' || cap === 'Light' || cap === 'Dark' || cap === 'System') {
      return cap;
    }
    return 'Soothing';
  });

  const [dateFormat, setDateFormatState] = useState<DateFormatCode>(() => {
    return (localStorage.getItem('standiq-date-fmt') as DateFormatCode) || 'DD MMM YYYY';
  });

  useEffect(() => {
    let mode = theme.toLowerCase();
    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'soothing';
    }
    document.documentElement.classList.remove('dark', 'light', 'soothing');
    document.documentElement.classList.add(mode);
    localStorage.setItem('maanakai-theme', theme.toLowerCase());
  }, [theme]);

  const setTheme = (newTheme: ThemeCode) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    localStorage.setItem('standiq-lang', newLang);
  };

  const setDateFormat = (newFmt: DateFormatCode) => {
    setDateFormatState(newFmt);
    localStorage.setItem('standiq-date-fmt', newFmt);
  };

  const formatDate = (dateStr: string) => {
    return formatWithTemplate(dateStr, dateFormat);
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.English;
    return langDict[key] || TRANSLATIONS.English[key] || key;
  };

  const user = {
    name: 'Anirudh',
    initials: 'AS',
    email: 'anirudh.sarve@procurement.gov.in',
    role: 'Senior Procurement Officer',
    department: 'Electrical & Industrial Equipment',
  };

  const markAlertsAsRead = () => {
    setUnreadAlertsCount(0);
  };

  return (
    <StandIQContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        isInBasket,
        clearBasket,
        documentBaskets,
        getDocumentBasket,
        addToDocumentBasket,
        removeFromDocumentBasket,
        isInDocumentBasket,
        clearDocumentBasket,
        documents,
        activeDocId,
        activeDocument,
        setActiveDocId,
        addOrUpdateDocument,
        deleteDocument,
        updateDocumentRequirements,
        updateDocumentStandards,
        procurementDraft,
        setProcurementDraft,
        resetProcurementDraft,
        user,
        unreadAlertsCount,
        markAlertsAsRead,
        language,
        setLanguage,
        theme,
        setTheme,
        dateFormat,
        setDateFormat,
        formatDate,
        t,
      }}
    >
      {children}
    </StandIQContext.Provider>
  );
}

export function useStandIQ() {
  const context = useContext(StandIQContext);
  if (!context) {
    throw new Error('useStandIQ must be used within a StandIQProvider');
  }
  return context;
}

// BISense Aliases
export const useBISense = useStandIQ;
export const BISenseProvider = StandIQProvider;

