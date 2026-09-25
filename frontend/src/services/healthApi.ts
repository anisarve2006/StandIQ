import { fetchApi } from './api';

export interface HealthResponse {
  status: string;
  version: string;
  corpus_metrics?: Record<string, any>;
}

export const healthApi = {
  checkHealth: () => fetchApi<HealthResponse>('/api/v1/health'),
};
