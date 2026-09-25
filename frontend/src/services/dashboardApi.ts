import { fetchApi } from './api';
import type { DashboardSummary } from '../types/api';

export const getDashboardSummary = () => fetchApi<DashboardSummary>('/api/v1/dashboard/summary');
