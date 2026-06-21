import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useInventoryMovements = (productId?: string, page = 1, pageSize = 50) =>
  useQuery({
    queryKey: ['inventory-movements', productId, page],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (productId) p.set('productId', productId);
      return api.get<{ data: any[]; total: number; totalPages: number }>(`/inventory/movements?${p}`);
    },
  });

export const useLowStock = () =>
  useQuery({ queryKey: ['low-stock'], queryFn: () => api.get<any[]>('/inventory/low-stock'), staleTime: 30000 });

export const useRecordMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/inventory/movement', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-movements'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['low-stock'] });
    },
  });
};
