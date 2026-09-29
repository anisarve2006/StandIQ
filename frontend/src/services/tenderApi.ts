import { fetchApi } from './api';
import type { 
  TenderAnalyzeRequest, TenderAnalyzeResponse, 
  TenderHealthRequest, TenderHealthResponse,
  TenderDiffRequest, TenderDiffResponse,
  SpecificationGenerateRequest, SpecificationGenerateResponse,
  ExportRequest, ExportResponse
} from '../types/api';

export const tenderApi = {
  analyze: async (data: TenderAnalyzeRequest): Promise<TenderAnalyzeResponse> => {
    return fetchApi('/api/v1/tender/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  health: async (data: TenderHealthRequest): Promise<TenderHealthResponse> => {
    return fetchApi('/api/v1/tender/health', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  diff: async (data: TenderDiffRequest): Promise<TenderDiffResponse> => {
    return fetchApi('/api/v1/tender/diff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  generateSpecification: async (data: SpecificationGenerateRequest): Promise<SpecificationGenerateResponse> => {
    return fetchApi('/api/v1/specification/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  exportSession: async (data: ExportRequest): Promise<ExportResponse> => {
    return fetchApi('/api/v1/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  auditRisk: async (data: { tender_text?: string; clauses?: string[]; target_standard?: string }): Promise<any> => {
    return fetchApi('/api/v1/tender/audit-risk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

