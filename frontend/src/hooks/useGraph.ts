import { useQuery } from '@tanstack/react-query';
import { getKnowledgeGraph } from '../services/graphApi';

export function useKnowledgeGraph(familyId: string | null) {
  return useQuery({
    queryKey: ['graph', familyId],
    queryFn: () => getKnowledgeGraph(familyId!),
    enabled: !!familyId,
  });
}
