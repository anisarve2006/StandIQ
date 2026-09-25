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
    return fetchApi('/tender/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  health: async (data: TenderHealthRequest): Promise<TenderHealthResponse> => {
    return fetchApi('/tender/health', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  diff: async (data: TenderDiffRequest): Promise<TenderDiffResponse> => {
    return fetchApi('/tender/diff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  generateSpecification: async (data: SpecificationGenerateRequest): Promise<SpecificationGenerateResponse> => {
    return fetchApi('/specification/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  exportSession: async (data: ExportRequest): Promise<ExportResponse> => {
    return fetchApi('/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
