import type { ProcurementDraft } from './procurement.types';

export const initialProcurementDraft: ProcurementDraft = {
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
