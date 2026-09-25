import { fetchApi } from './api';
import type { 
  StandardRecommendationRequest, 
  RecommendationResponse, 
  VersionResponse, 
  CertificationResponse, 
  AlliedStandardsResponse 
} from '../types/api';

export const standardsApi = {
  recommend: (data: StandardRecommendationRequest) => 
    fetchApi<RecommendationResponse>('/api/v1/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getVersions: (familyId: string) => 
    fetchApi<VersionResponse>(`/api/v1/standard/${familyId}/versions`),
    
  getCertification: (familyId: string) => 
    fetchApi<CertificationResponse>(`/api/v1/standard/${familyId}/certification`),
    
  getAllied: (familyId: string) => 
    fetchApi<AlliedStandardsResponse>(`/api/v1/standard/${familyId}/allied`),
};
