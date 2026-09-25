import { fetchApi } from './api';

export interface VerifyRequest {
  tender_clause: string;
  evidence_pack: Record<string, any>;
}

export interface VerificationResponse {
  verification_status: string;
  confidence: number;
  reason: string;
  provenance?: string;
  source?: string;
  standard_id?: string;
}

export const verificationApi = {
  verify: (data: VerifyRequest) =>
    fetchApi<VerificationResponse>('/api/v1/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
