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
}

export const INITIAL_BASKET_STANDARDS: BasketStandard[] = [
  {
    id: 'IS 12615:2018',
    code: 'IS 12615:2018',
    title: 'Energy Efficient Induction Motors (Three-phase)',
    type: 'Product',
    status: 'Current',
    year: 2018,
    reaffirmedYear: 2023,
    relatedCount: 7,
    tags: ['Product Standard', 'Energy Efficiency', 'Testing Requirements'],
    mandatory: true,
  },
  {
    id: 'IS 325:1996',
    code: 'IS 325:1996',
    title: 'Three-phase Induction Motors',
    type: 'Product',
    status: 'Current',
    year: 1996,
    reaffirmedYear: 2019,
    relatedCount: 5,
    tags: ['Product Standard', 'General Requirements', 'Dimensions'],
    mandatory: true,
  },
  {
    id: 'IS 8789:1981',
    code: 'IS 8789:1981',
    title: 'Method of Test for Efficiency',
    type: 'Testing',
    status: 'Current',
    year: 1981,
    reaffirmedYear: 2021,
    relatedCount: 4,
    tags: ['Testing Standard', 'Efficiency Test'],
  },
  {
    id: 'IS 302:2008',
    code: 'IS 302:2008',
    title: 'Safety of Electrical Equipment',
    type: 'Safety',
    status: 'Current',
    year: 2008,
    reaffirmedYear: 2022,
    relatedCount: 8,
    tags: ['Safety Standard', 'General Safety'],
    mandatory: true,
  },
  {
    id: 'IS 9383:1997',
    code: 'IS 9383:1997',
    title: 'Installation of Electrical Equipment',
    type: 'Installation',
    status: 'Current',
    year: 1997,
    reaffirmedYear: 2020,
    relatedCount: 3,
    tags: ['Installation Standard', 'Site Installation'],
  },
];

export type LanguageCode = 'English' | 'Hindi' | 'Marathi' | 'Tamil' | 'Gujarati';
export type DateFormatCode = 'DD MMM YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY';
export type ThemeCode = 'Soothing' | 'Light' | 'Dark' | 'System';

// Multilingual Dictionary
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

// Date Formatter helper
export function formatWithTemplate(dateStr: string, template: DateFormatCode): string {
  if (!dateStr) return '';

  // Parse common dates like "24 Sep 2026", "22 Sep 2026", "2026-09-24", etc.
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
      // YYYY-MM-DD
      year = parts[0];
      month = parts[1];
      day = parts[2];
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthName = monthNames[parseInt(month, 10)] || 'Sep';
    } else {
      // DD MMM YYYY or DD MM YYYY
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

  if (template === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  if (template === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  // Default: DD MMM YYYY
  return `${day} ${monthName} ${year}`;
}

interface StandIQContextType {
  basket: BasketStandard[];
  addToBasket: (standard: BasketStandard) => void;
  removeFromBasket: (id: string) => void;
  isInBasket: (id: string) => boolean;
  clearBasket: () => void;
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
  const [basket, setBasket] = useState<BasketStandard[]>(INITIAL_BASKET_STANDARDS);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(12);

  // Preference states loaded from localStorage
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

  // Apply theme to DOM on mount and changes
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

  const addToBasket = (standard: BasketStandard) => {
    setBasket((prev) => {
      if (prev.some((s) => s.id === standard.id || s.code === standard.code)) {
        return prev;
      }
      return [...prev, standard];
    });
  };

  const removeFromBasket = (id: string) => {
    setBasket((prev) => prev.filter((s) => s.id !== id && s.code !== id));
  };

  const isInBasket = (id: string) => {
    return basket.some((s) => s.id === id || s.code === id);
  };

  const clearBasket = () => {
    setBasket([]);
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
