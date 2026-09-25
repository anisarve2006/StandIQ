export interface ExportOption {
  id: string;
  format: string;
  description: string;
  status: string;
}

export interface ExportPackageContent {
  id: string;
  label: string;
  included: boolean;
}
