import { useQuery, useMutation } from '@tanstack/react-query';
import { standardsApi } from '../services/standardsApi';
import type { StandardRecommendationRequest } from '../types/api';

export function useRecommendStandards() {
  return useMutation({
    mutationFn: (request: StandardRecommendationRequest) => standardsApi.recommend(request),
  });
}

export function useStandardVersions(familyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['standardVersions', familyId],
    queryFn: () => standardsApi.getVersions(familyId),
    enabled: !!familyId && options?.enabled !== false,
  });
}

export function useStandardCertification(familyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['standardCertification', familyId],
    queryFn: () => standardsApi.getCertification(familyId),
    enabled: !!familyId && options?.enabled !== false,
  });
}

export function useAlliedStandards(familyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['alliedStandards', familyId],
    queryFn: () => standardsApi.getAllied(familyId),
    enabled: !!familyId && options?.enabled !== false,
  });
}

export function useStandard(familyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['standard', familyId],
    queryFn: () => standardsApi.getStandard(familyId),
    enabled: !!familyId && options?.enabled !== false,
  });
}
