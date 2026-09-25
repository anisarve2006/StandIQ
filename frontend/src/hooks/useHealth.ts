import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../services/healthApi';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.checkHealth,
  });
}
