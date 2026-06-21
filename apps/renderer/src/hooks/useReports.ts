import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useSalesReport = (from?: string, to?: string, groupBy = 'day') =>
  useQuery({
    queryKey: ['report-sales', from, to, groupBy],
    queryFn: () => {
      const p = new URLSearchParams({ groupBy });
      if (from) p.set('from', from);
      if (to) p.set('to', to);
      return api.get<any>(`/reports/sales?${p}`);
    },
    enabled: true,
  });

export const useProductsReport = (from?: string, to?: string) =>
  useQuery({
    queryKey: ['report-products', from, to],
    queryFn: () => {
      const p = new URLSearchParams();
      if (from) p.set('from', from);
      if (to) p.set('to', to);
      return api.get<any[]>(`/reports/products?${p}`);
    },
  });

export const useInventoryReport = () =>
  useQuery({ queryKey: ['report-inventory'], queryFn: () => api.get<any[]>('/reports/inventory'), staleTime: 30000 });
