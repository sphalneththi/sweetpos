import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useProducts = (categoryId?: string, search?: string, page = 1, pageSize = 100) =>
  useQuery({
    queryKey: ['products', categoryId, search, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), isActive: 'true' });
      if (categoryId && categoryId !== 'all') params.set('categoryId', categoryId);
      if (search) params.set('search', search);
      return api.get<{ data: any[]; total: number; totalPages: number }>(`/products?${params}`);
    },
    staleTime: 30000,
  });

export const useProductById = (id: string) =>
  useQuery({ queryKey: ['product', id], queryFn: () => api.get<any>(`/products/${id}`), enabled: !!id });

export const useProductByBarcode = (barcode: string) =>
  useQuery({ queryKey: ['product-barcode', barcode], queryFn: () => api.get<any>(`/products/barcode/${barcode}`), enabled: !!barcode });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => api.post('/products', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => api.put(`/products/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/products/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
};
