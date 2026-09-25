export interface SpecificationRequirement {
  id: string;
  sectionId: string;
  parameter: string;
  value: string;
  unit?: string;
  sourceLabel: string;
  sourceStatus: 'VERIFIED' | 'NEEDS REVIEW' | 'MISSING';
}

export interface SpecificationSection {
  id: string;
  title: string;
  requirements: SpecificationRequirement[];
}
