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

// Seed Documents with Dedicated Baskets and Complete Output
export const INITIAL_DOCUMENTS: AnalyzedDocument[] = [
  {
    id: 'motors',
    fileName: 'Tender_Document_Motors.pdf',
    fileSize: '2.4 MB',
    totalPages: 45,
    department: 'ENGINEERING & PROCUREMENT CELL, CENTRAL POWER UTILITY',
    tenderNumber: 'TDR/2026/ELEC-IND/042-REV1',
    title: 'TECHNICAL SPECIFICATION FOR THREE-PHASE INDUCTION MOTORS',
    section: 'SECTION 4 — TECHNICAL REQUIREMENTS & PERFORMANCE',
    category: 'Electrical Equipment',
    uploadedAt: '24 Sep 2026',
    status: 'In Review',
    fileType: 'pdf',
    auditSummary: {
      pages: 45,
      totalItems: 5,
      mandatoryQcoItems: 3,
      voluntaryItems: 2,
      complianceScore: 94,
      processingTimeSeconds: 1.4,
    },
    clauses: [
      {
        id: 'c-4.1',
        number: '4.1',
        title: 'Scope of Supply & Ambient Conditions',
        text: 'The contractor shall design, manufacture, test, and supply high-performance electrical drives suitable for continuous industrial duty under tropical ambient temperature conditions (-5°C to 50°C) with relative humidity up to 95%.',
        isHighlighted: false,
      },
      {
        id: 'c-4.2',
        number: '4.2',
        title: 'Electric Motors & Efficiency Class',
        text: 'The motor shall be three-phase induction type rated for 415V ±10%, 50Hz ±5% with minimum efficiency of 90% (IE3 Premium Efficiency equivalent as per IS 12615:2018) and shall be suitable for continuous S1 duty in outdoor environments.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #1 & #2',
        matchedRequirementId: 1,
        matchedStandard: 'IS 12615:2018',
      },
      {
        id: 'c-4.3',
        number: '4.3',
        title: 'Testing & Quality Verification Protocols',
        text: 'All motors shall be type tested for efficiency, temperature rise, and insulation resistance conforming to IS 12615:2018 and IS 8789:1981 loss summation procedures. Routine test certificates must accompany every consignment.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #4',
        matchedRequirementId: 4,
        matchedStandard: 'IS 8789:1981',
      },
      {
        id: 'c-4.4',
        number: '4.4',
        title: 'Enclosure Protection & Insulation Class',
        text: 'Enclosure protection shall conform to minimum IP55 rating with Class F insulation and temperature rise restricted to Class B limits conforming to IS 325:1996 and IS 302:2008.',
        isHighlighted: false,
      },
      {
        id: 'c-4.5',
        number: '4.5',
        title: 'Terminal Box & Grounding System',
        text: 'Terminal box shall have IP66 ingress protection with dual brass grounding terminals. Metric PG gland plates must be provided for armored copper cables conforming to IS 1231.',
        isHighlighted: false,
      },
    ],
    requirements: [
      {
        id: 1,
        title: 'Motor Type & Voltage Rating',
        severity: 'High',
        requirementText: 'Three-phase induction motor, 415V ±10%, 50Hz for S1 duty',
        recommendedStandard: 'IS 12615:2018',
        status: 'accepted',
        clauseNumber: '4.2',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 2,
        title: 'Efficiency Level (IE3)',
        severity: 'High',
        requirementText: 'Minimum efficiency of 90% (IE3 equivalent under BIS QCO)',
        recommendedStandard: 'IS 12615:2018',
        status: 'accepted',
        clauseNumber: '4.2',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 3,
        title: 'Operating Ambient Limits',
        severity: 'Medium',
        requirementText: 'Continuous operation outdoor conditions (ambient -5°C to 50°C, 95% RH)',
        recommendedStandard: 'IS 325:1996',
        status: 'pending',
        clauseNumber: '4.1',
        category: 'Testing',
      },
      {
        id: 4,
        title: 'Type Testing Protocols',
        severity: 'High',
        requirementText: 'Type tested for efficiency, heating and insulation as per IS 12615:2018',
        recommendedStandard: 'IS 8789:1981',
        status: 'pending',
        clauseNumber: '4.3',
        category: 'Testing',
        isMandatoryQco: true,
      },
      {
        id: 5,
        title: 'Enclosure Protection (IP55)',
        severity: 'Medium',
        requirementText: 'IP55 enclosure rating with Class F insulation and Class B temperature rise',
        recommendedStandard: 'IS 302:2008',
        status: 'pending',
        clauseNumber: '4.4',
        category: 'Safety',
      },
    ],
    recommendedStandards: [
      {
        code: 'IS 12615:2018',
        title: 'Energy Efficient Induction Motors (Three-phase)',
        match: 94,
        type: 'Product',
        status: 'Current',
        rationale: 'Mandatory standard for IE3 three-phase industrial motors under Compulsory QCO order.',
      },
      {
        code: 'IS 325:1996',
        title: 'Three-phase Induction Motors - General Specifications',
        match: 88,
        type: 'Product',
        status: 'Current',
        rationale: 'Governs frame sizes, mounting boundaries, and operational tolerances.',
      },
      {
        code: 'IS 8789:1981',
        title: 'Method of Test for Efficiency of Induction Motors',
        match: 91,
        type: 'Testing',
        status: 'Current',
        rationale: 'Prescribed test protocols for losses summation and verification.',
      },
      {
        code: 'IS 302:2008',
        title: 'Safety of Electrical Equipment - General Requirements',
        match: 85,
        type: 'Safety',
        status: 'Current',
        rationale: 'Ensures dielectric clearance, creepage limits, and grounding safety.',
      },
      {
        code: 'IS 9383:1997',
        title: 'Installation of Electrical Equipment',
        match: 82,
        type: 'Installation',
        status: 'Current',
        rationale: 'Mandatory on-site foundation anchoring and vibrational limits.',
      },
    ],
    basket: [
      {
        id: 'IS 12615:2018',
        code: 'IS 12615:2018',
        title: 'Energy Efficient Induction Motors (Three-phase)',
        type: 'Product',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 325:1996',
        code: 'IS 325:1996',
        title: 'Three-phase Induction Motors - General Specifications',
        type: 'Product',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 8789:1981',
        code: 'IS 8789:1981',
        title: 'Method of Test for Efficiency of Induction Motors',
        type: 'Testing',
        status: 'Current',
      },
      {
        id: 'IS 302:2008',
        code: 'IS 302:2008',
        title: 'Safety of Electrical Equipment - General Requirements',
        type: 'Safety',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 9383:1997',
        code: 'IS 9383:1997',
        title: 'Installation of Electrical Equipment',
        type: 'Installation',
        status: 'Current',
      },
    ],
  },
  {
    id: 'panels',
    fileName: 'Electrical_Distribution_Panel_Tender_2026.pdf',
    fileSize: '2.4 MB',
    totalPages: 38,
    department: 'URBAN INFRASTRUCTURE DEVELOPMENT CORPORATION',
    tenderNumber: 'UIDC/ELECT-DIST/LV-PANEL/2026-09',
    title: 'SPECIFICATION FOR 415V LOW VOLTAGE SWITCHGEAR & DISTRIBUTION BOARDS',
    section: 'SECTION 3 — SWITCHGEAR ASSEMBLY & BUSBAR REQUIREMENTS',
    category: 'Electrical Equipment',
    uploadedAt: '24 Sep 2026',
    status: 'Completed',
    fileType: 'pdf',
    auditSummary: {
      pages: 38,
      totalItems: 5,
      mandatoryQcoItems: 4,
      voluntaryItems: 1,
      complianceScore: 96,
      processingTimeSeconds: 1.2,
    },
    clauses: [
      {
        id: 'c-3.1',
        number: '3.1',
        title: 'Assembly Standards & Rated Insulation Voltage',
        text: 'The switchgear assembly shall be low-voltage design conforming strictly to IS/IEC 61439-1 & 2. Rated insulation voltage shall be 1000V AC 3-phase 4-wire 50Hz with impulse withstand voltage of 8kV.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #1',
        matchedRequirementId: 1,
        matchedStandard: 'IS/IEC 61439-1:2011',
      },
      {
        id: 'c-3.2',
        number: '3.2',
        title: 'Busbar Material & Short-Circuit Withstand',
        text: 'Busbars shall be manufactured from 99.9% pure electrolytic grade high-conductivity copper. The main horizontal and vertical busbars shall withstand a prospective short-circuit fault current of 50kA RMS for 1.0 second.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #2',
        matchedRequirementId: 2,
        matchedStandard: 'IS 8623:1993',
      },
    ],
    requirements: [
      {
        id: 1,
        title: 'Panel Conformance & Voltage Rating',
        severity: 'High',
        requirementText: 'Assembly conformance to IS/IEC 61439-1/2, rated insulation 1000V AC',
        recommendedStandard: 'IS/IEC 61439-1:2011',
        status: 'accepted',
        clauseNumber: '3.1',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 2,
        title: 'Busbar Short-Circuit Withstand',
        severity: 'High',
        requirementText: '50kA RMS for 1.0 second withstand, 99.9% electrolytic copper busbars',
        recommendedStandard: 'IS 8623:1993',
        status: 'accepted',
        clauseNumber: '3.2',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 3,
        title: 'Breakers Breaking Capacity (Ics=100% Icu)',
        severity: 'High',
        requirementText: 'Air & Moulded Case Circuit Breakers with Ics = 100% Icu per IS/IEC 60947-2',
        recommendedStandard: 'IS/IEC 60947-2:2016',
        status: 'accepted',
        clauseNumber: '3.3',
        category: 'Safety',
        isMandatoryQco: true,
      },
      {
        id: 4,
        title: 'Enclosure Ingress Protection (IP54)',
        severity: 'Medium',
        requirementText: 'Compartmentalized 2.0mm CRCA steel enclosure with minimum IP54 protection',
        recommendedStandard: 'IS 12063:1987',
        status: 'pending',
        clauseNumber: '3.4',
        category: 'Testing',
      },
    ],
    recommendedStandards: [
      {
        code: 'IS/IEC 61439-1:2011',
        title: 'Low-Voltage Switchgear and Controlgear Assemblies - Part 1',
        match: 96,
        type: 'Product',
        status: 'Current',
        rationale: 'Mandatory BIS standard for low-voltage power distribution switchboards.',
      },
      {
        code: 'IS/IEC 60947-2:2016',
        title: 'Low-Voltage Switchgear and Controlgear - Part 2: Circuit-Breakers',
        match: 93,
        type: 'Product',
        status: 'Current',
        rationale: 'Specifies tripping characteristics, breaking capacities, and isolation criteria.',
      },
      {
        code: 'IS 8623:1993',
        title: 'Specification for Low-Voltage Switchgear and Controlgear Assemblies',
        match: 90,
        type: 'Testing',
        status: 'Current',
        rationale: 'Essential for busbar electrodynamic short-circuit withstand verification.',
      },
      {
        code: 'IS 12063:1987',
        title: 'Classification of Degrees of Protection by Enclosures (IP Code)',
        match: 87,
        type: 'Testing',
        status: 'Current',
        rationale: 'Standardized classification for IP54 dust and splash ingress testing.',
      },
    ],
    basket: [
      {
        id: 'IS/IEC 61439-1:2011',
        code: 'IS/IEC 61439-1:2011',
        title: 'Low-Voltage Switchgear and Controlgear Assemblies - Part 1',
        type: 'Product',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS/IEC 60947-2:2016',
        code: 'IS/IEC 60947-2:2016',
        title: 'Low-Voltage Switchgear and Controlgear - Part 2: Circuit-Breakers',
        type: 'Product',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 8623:1993',
        code: 'IS 8623:1993',
        title: 'Specification for Low-Voltage Switchgear and Controlgear Assemblies',
        type: 'Testing',
        status: 'Current',
      },
      {
        id: 'IS 12063:1987',
        code: 'IS 12063:1987',
        title: 'Classification of Degrees of Protection by Enclosures (IP Code)',
        type: 'Testing',
        status: 'Current',
      },
    ],
  },
  {
    id: 'solar',
    fileName: 'Solar_PV_Inverter_Grid_Specification.pdf',
    fileSize: '3.1 MB',
    totalPages: 58,
    department: 'STATE RENEWABLE ENERGY DEVELOPMENT AGENCY',
    tenderNumber: 'REDA/SOLAR-MW/INV-SPEC/2026',
    title: 'SPECIFICATION FOR GRID-TIED STRING INVERTERS & POWER CONDITIONING UNITS (PCU)',
    section: 'SECTION 5 — INVERTER CONVERSION & GRID COMPLIANCE',
    category: 'Renewable Energy',
    uploadedAt: '20 Sep 2026',
    status: 'In Review',
    fileType: 'pdf',
    auditSummary: {
      pages: 58,
      totalItems: 5,
      mandatoryQcoItems: 4,
      voluntaryItems: 1,
      complianceScore: 92,
      processingTimeSeconds: 1.6,
    },
    clauses: [
      {
        id: 'c-5.1',
        number: '5.1',
        title: 'Power Rating, Topology & Conversion Efficiency',
        text: 'Inverters shall be 100kW 3-phase 415V 50Hz transformerless grid-interactive string type. Maximum conversion efficiency shall be greater than 98.8% with European weighted efficiency not less than 98.5%.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #1',
        matchedRequirementId: 1,
        matchedStandard: 'IS 16221:2016',
      },
      {
        id: 'c-5.3',
        number: '5.3',
        title: 'Anti-Islanding Protection & Grid Disconnection',
        text: 'In the event of utility grid outage or voltage/frequency excursions, the inverter shall disconnect automatically within 2.0 seconds in accordance with IS 16169:2014 and CEA Technical Standards for Grid Connectivity.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #2',
        matchedRequirementId: 2,
        matchedStandard: 'IS 16169:2014',
      },
    ],
    requirements: [
      {
        id: 1,
        title: 'Inverter Efficiency (>98.8%)',
        severity: 'High',
        requirementText: 'Transformerless string inverter, max efficiency > 98.8%, Euro efficiency > 98.5%',
        recommendedStandard: 'IS 16221:2016',
        status: 'accepted',
        clauseNumber: '5.1',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 2,
        title: 'Anti-Islanding Protection (<2.0s)',
        severity: 'High',
        requirementText: 'Automatic grid disconnect within 2.0 seconds on grid loss per IS 16169:2014',
        recommendedStandard: 'IS 16169:2014',
        status: 'accepted',
        clauseNumber: '5.3',
        category: 'Safety',
        isMandatoryQco: true,
      },
      {
        id: 3,
        title: 'Safety of Power Converters (BIS QCO)',
        severity: 'High',
        requirementText: 'Photovoltaic power converters safety qualification conforming to IS 16221 (Part 2)',
        recommendedStandard: 'IS 16221 (Part 2):2015',
        status: 'accepted',
        clauseNumber: '5.5',
        category: 'Safety',
        isMandatoryQco: true,
      },
      {
        id: 4,
        title: 'Ingress Protection (IP65 Outdoor)',
        severity: 'Medium',
        requirementText: 'IP65 outdoor rated enclosure with integrated Type II AC/DC surge protectors',
        recommendedStandard: 'IS 12063:1987',
        status: 'pending',
        clauseNumber: '5.5',
        category: 'Testing',
      },
    ],
    recommendedStandards: [
      {
        code: 'IS 16221 (Part 2):2015',
        title: 'Safety of Power Converters for use in Photovoltaic Power Systems',
        match: 97,
        type: 'Safety',
        status: 'Current',
        rationale: 'Mandatory standard under MNRE Quality Control Order for solar grid inverters.',
      },
      {
        code: 'IS 16169:2014',
        title: 'Test Procedure of Islanding Prevention Measures for Utility-Interconnected PV Inverters',
        match: 94,
        type: 'Testing',
        status: 'Current',
        rationale: 'Governs disconnection safety trip thresholds under utility distribution outages.',
      },
      {
        code: 'IS 14286:2010',
        title: 'Crystalline Silicon Terrestrial Photovoltaic (PV) Modules - Design Qualification',
        match: 89,
        type: 'Product',
        status: 'Current',
        rationale: 'Allied standard ensuring electrical insulation and DC string safety with inverter input.',
      },
      {
        code: 'IS/IEC 60068-2-1:2007',
        title: 'Environmental Testing: Cold, Dry Heat and Damp Heat',
        match: 86,
        type: 'Testing',
        status: 'Current',
        rationale: 'Verifies thermal cycling and IP65 enclosure withstand under extreme tropical heat.',
      },
    ],
    basket: [
      {
        id: 'IS 16221 (Part 2):2015',
        code: 'IS 16221 (Part 2):2015',
        title: 'Safety of Power Converters for use in Photovoltaic Power Systems',
        type: 'Safety',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 16169:2014',
        code: 'IS 16169:2014',
        title: 'Test Procedure of Islanding Prevention Measures for Utility-Interconnected PV Inverters',
        type: 'Testing',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 14286:2010',
        code: 'IS 14286:2010',
        title: 'Crystalline Silicon Terrestrial Photovoltaic (PV) Modules',
        type: 'Product',
        status: 'Current',
      },
      {
        id: 'IS/IEC 60068-2-1:2007',
        code: 'IS/IEC 60068-2-1:2007',
        title: 'Environmental Testing: Cold, Dry Heat and Damp Heat',
        type: 'Testing',
        status: 'Current',
      },
    ],
  },
  {
    id: 'pumps',
    fileName: 'Centrifugal_Water_Pumps_Procurement_Spec.pdf',
    fileSize: '1.8 MB',
    totalPages: 32,
    department: 'STATE WATER SUPPLY & SEWERAGE BOARD',
    tenderNumber: 'WSSB/MECH/PUMP-CLEAR/2026-44',
    title: 'TECHNICAL SPECIFICATIONS FOR END-SUCTION CENTRIFUGAL WATER PUMPS',
    section: 'SECTION 2 — HYDRAULIC & MECHANICAL SPECIFICATIONS',
    category: 'Industrial Equipment',
    uploadedAt: '16 Sep 2026',
    status: 'Ready',
    fileType: 'pdf',
    auditSummary: {
      pages: 32,
      totalItems: 5,
      mandatoryQcoItems: 3,
      voluntaryItems: 2,
      complianceScore: 91,
      processingTimeSeconds: 1.1,
    },
    clauses: [
      {
        id: 'c-2.1',
        number: '2.1',
        title: 'Pump Type, Capacity & Efficiency Rating',
        text: 'Pumps shall be horizontal end-suction, back pull-out centrifugal type designed for handling clear cold potable water. Rated discharge shall be 50 LPS at 45 meters total dynamic head with minimum pump hydraulic efficiency not less than 78% as per IS 1520:1980.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #1 & #2',
        matchedRequirementId: 1,
        matchedStandard: 'IS 1520:1980',
      },
      {
        id: 'c-2.4',
        number: '2.4',
        title: 'Hydrostatic Pressure Testing of Casing',
        text: 'All pump casings and suction/discharge heads shall be hydrostatically tested at the manufacturer works to 1.5 times the maximum working pressure or 2.0 times the shut-off head for minimum 30 minutes without leakage conforming to IS 5120:1977.',
        isHighlighted: true,
        highlightNote: 'AI Extracted Requirement #4',
        matchedRequirementId: 4,
        matchedStandard: 'IS 5120:1977',
      },
    ],
    requirements: [
      {
        id: 1,
        title: 'Pump Type & Hydraulic Duty',
        severity: 'High',
        requirementText: 'Horizontal end-suction centrifugal pump, 50 LPS @ 45m head, min 78% efficiency',
        recommendedStandard: 'IS 1520:1980',
        status: 'accepted',
        clauseNumber: '2.1',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 2,
        title: 'Mandatory ISI Certification',
        severity: 'High',
        requirementText: 'Pump sets shall carry valid BIS ISI Mark certification under Centrifugal Pumps QCO',
        recommendedStandard: 'IS 1520:1980',
        status: 'accepted',
        clauseNumber: '2.1',
        category: 'Product',
        isMandatoryQco: true,
      },
      {
        id: 3,
        title: 'Hydrostatic Casing Test (1.5x Pressure)',
        severity: 'High',
        requirementText: 'Hydrostatic pressure withstand test at 1.5x working pressure for 30 minutes',
        recommendedStandard: 'IS 5120:1977',
        status: 'pending',
        clauseNumber: '2.4',
        category: 'Testing',
      },
      {
        id: 4,
        title: 'Performance Acceptance Test (Grade 2B)',
        severity: 'High',
        requirementText: 'Full speed hydraulic performance and NPSHR verification per Grade 2B',
        recommendedStandard: 'IS 9137:2019',
        status: 'pending',
        clauseNumber: '2.5',
        category: 'Testing',
      },
    ],
    recommendedStandards: [
      {
        code: 'IS 1520:1980',
        title: 'Horizontal Centrifugal Pumps for Clear, Cold, Fresh Water',
        match: 95,
        type: 'Product',
        status: 'Current',
        rationale: 'Mandatory Indian Standard governing performance and BIS ISI marking for clean water pumps.',
      },
      {
        code: 'IS 5120:1977',
        title: 'Technical Requirements for Rotodynamic Special Purpose Pumps',
        match: 91,
        type: 'Product',
        status: 'Current',
        rationale: 'Defines mechanical construction, hydrostatic test pressures, and shaft deflection limits.',
      },
      {
        code: 'IS 9137:2019',
        title: 'Acceptance Tests for Centrifugal, Mixed Flow and Axial Pumps',
        match: 93,
        type: 'Testing',
        status: 'Current',
        rationale: 'Establishes precise Grade 2B test tolerances, flow metering, and power measurements.',
      },
      {
        code: 'IS/ISO 9906:2012',
        title: 'Rotodynamic Pumps - Hydraulic Performance Acceptance Tests',
        match: 88,
        type: 'Testing',
        status: 'Current',
        rationale: 'Harmonized international standard for pump efficiency curves and NPSH evaluation.',
      },
    ],
    basket: [
      {
        id: 'IS 1520:1980',
        code: 'IS 1520:1980',
        title: 'Horizontal Centrifugal Pumps for Clear, Cold, Fresh Water',
        type: 'Product',
        status: 'Current',
        mandatory: true,
      },
      {
        id: 'IS 5120:1977',
        code: 'IS 5120:1977',
        title: 'Technical Requirements for Rotodynamic Special Purpose Pumps',
        type: 'Product',
        status: 'Current',
      },
      {
        id: 'IS 9137:2019',
        code: 'IS 9137:2019',
        title: 'Acceptance Tests for Centrifugal, Mixed Flow and Axial Pumps',
        type: 'Testing',
        status: 'Current',
      },
      {
        id: 'IS/ISO 9906:2012',
        code: 'IS/ISO 9906:2012',
        title: 'Rotodynamic Pumps - Hydraulic Performance Acceptance Tests',
        type: 'Testing',
        status: 'Current',
      },
    ],
  },
];

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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored documents:', e);
    }
    return INITIAL_DOCUMENTS;
  });

  // 2. Active Document ID
  const [activeDocId, setActiveDocIdState] = useState<string>(() => {
    return localStorage.getItem('standiq_active_doc_id') || 'motors';
  });

  // 3. Document Baskets State (Record<docId, BasketStandard[]>)
  const [documentBaskets, setDocumentBaskets] = useState<Record<string, BasketStandard[]>>(() => {
    try {
      const stored = localStorage.getItem('standiq_document_baskets_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading stored document baskets:', e);
    }
    // Default baskets from initial documents
    const initialBaskets: Record<string, BasketStandard[]> = {};
    INITIAL_DOCUMENTS.forEach(doc => {
      initialBaskets[doc.id] = doc.basket || [];
    });
    return initialBaskets;
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
      // Clean up blob URLs before persisting to avoid serialization issues
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
  const activeDocument: AnalyzedDocument = documents.find(d => d.id === activeDocId) || documents[0] || INITIAL_DOCUMENTS[0];

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
