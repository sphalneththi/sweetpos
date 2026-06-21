import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useSales = (filters?: { page?: number; pageSize?: number; from?: string; to?: string; status?: string }) =>
  useQuery({
    queryKey: ['sales', filters],
    queryFn: () => {
      const p = new URLSearchParams();
      if (filters?.page) p.set('page', String(filters.page));
      if (filters?.pageSize) p.set('pageSize', String(filters.pageSize));
      if (filters?.from) p.set('from', filters.from);
      if (filters?.to) p.set('to', filters.to);
      if (filters?.status) p.set('status', filters.status);
      return api.get<{ data: any[]; total: number; totalPages: number }>(`/sales?${p}`);
    },
  });

export const useSaleById = (id: string) =>
  useQuery({ queryKey: ['sale', id], queryFn: () => api.get<any>(`/sales/${id}`), enabled: !!id });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post<any>('/sales', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCancelSale = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.post(`/sales/${id}/cancel`), onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }) });
};

export const useDailySummary = (date?: string) =>
  useQuery({ queryKey: ['sales-summary', date], queryFn: () => api.get<any>(`/sales/summary${date ? `?date=${date}` : ''}`) });
