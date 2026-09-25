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
