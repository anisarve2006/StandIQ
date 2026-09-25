import { useQuery, useMutation } from '@tanstack/react-query';
import { procurementApi } from '../services/procurementApi';
import type { ProcurementSessionCreateRequest } from '../types/api';

export function useCreateSession() {
  return useMutation({
    mutationFn: (request: ProcurementSessionCreateRequest) => procurementApi.createSession(request),
  });
}

export function useGetSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['procurementSession', sessionId],
    queryFn: () => procurementApi.getSession(sessionId!),
    enabled: !!sessionId,
  });
}
