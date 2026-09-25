import { useMutation } from '@tanstack/react-query';
import { verificationApi } from '../services/verificationApi';
import type { VerifyRequest } from '../services/verificationApi';

export function useVerifyClause() {
  return useMutation({
    mutationFn: (request: VerifyRequest) => verificationApi.verify(request),
  });
}
