import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/dashboardApi';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });
};
