import { useQuery } from '@tanstack/react-query';
import { getChanges } from '../services/changesApi';

export function useChanges() {
  return useQuery({
    queryKey: ['changes'],
    queryFn: getChanges,
  });
}
