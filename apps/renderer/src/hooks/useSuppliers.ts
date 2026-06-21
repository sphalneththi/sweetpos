import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useSuppliers = (search?: string) =>
  useQuery({ queryKey: ['suppliers', search], queryFn: () => api.get<any[]>(`/suppliers${search ? `?search=${search}` : ''}`), staleTime: 30000 });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => api.post('/suppliers', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }) });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => api.put(`/suppliers/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }) });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/suppliers/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }) });
};
