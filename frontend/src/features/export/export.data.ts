import type { ExportOption, ExportPackageContent } from './export.types';

export const mockExportOptions: ExportOption[] = [
  { id: 'fmt1', format: 'PROCUREMENT SPECIFICATION', description: 'Structured procurement requirements', status: 'READY' },
  { id: 'fmt2', format: 'PDF', description: 'Human-readable review package', status: 'READY' },
  { id: 'fmt3', format: 'DOCX', description: 'Editable procurement document', status: 'READY' },
  { id: 'fmt4', format: 'JSON', description: 'Machine-readable specification', status: 'READY' },
  { id: 'fmt5', format: 'CSV', description: 'Requirement and standard mapping', status: 'READY' }
];

export const mockPackageContent: ExportPackageContent[] = [
  { id: 'pc1', label: 'Procurement information', included: true },
  { id: 'pc2', label: 'Structured requirements', included: true },
  { id: 'pc3', label: 'Selected standards', included: true },
  { id: 'pc4', label: 'Evidence references', included: true },
  { id: 'pc5', label: 'Version information', included: true },
  { id: 'pc6', label: 'Certification information', included: true },
  { id: 'pc7', label: 'Verification status', included: true },
  { id: 'pc8', label: 'Review findings', included: true }
];
