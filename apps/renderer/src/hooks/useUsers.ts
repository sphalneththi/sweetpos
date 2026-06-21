import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useUsers = () =>
  useQuery({ queryKey: ['users'], queryFn: () => api.get<any[]>('/users') });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => api.post('/users', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => api.put(`/users/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/users/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
};
