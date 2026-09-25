import { fetchApi } from './api';
import type { KnowledgeGraphResponse } from '../types/api';

export const getKnowledgeGraph = (familyId: string) => fetchApi<KnowledgeGraphResponse>(`/api/v1/graph/standard/${familyId}`);
