import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useCustomers = (search?: string, page = 1, pageSize = 50) =>
  useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) p.set('search', search);
      return api.get<{ data: any[]; total: number; totalPages: number }>(`/customers?${p}`);
    },
    staleTime: 30000,
  });

export const useCustomerById = (id: string) =>
  useQuery({ queryKey: ['customer', id], queryFn: () => api.get<any>(`/customers/${id}`), enabled: !!id });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => api.post('/customers', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }) });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => api.put(`/customers/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }) });
};
