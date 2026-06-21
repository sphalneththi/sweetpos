import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { useAuthStore } from '../stores/auth.store';
import { UserRole } from '@sweetpos/shared-types';

export const useDashboard = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  return useQuery({
    queryKey: ['dashboard', user?.role],
    queryFn: () => api.get<any>(isAdmin ? '/dashboard/admin' : '/dashboard/cashier'),
    staleTime: 60000,
    refetchInterval: 120000,
  });
};
