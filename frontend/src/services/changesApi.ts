import { fetchApi } from './api';
import type { ChangesResponse } from '../types/api';

export const getChanges = () => fetchApi<ChangesResponse>('/api/v1/changes');
