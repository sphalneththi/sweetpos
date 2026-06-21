import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => api.get<any[]>('/categories'), staleTime: 60000 });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => api.post('/categories', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }) });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => api.put(`/categories/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }) });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/categories/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }) });
};
