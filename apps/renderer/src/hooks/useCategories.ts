import { useQuery } from '@tanstack/react-query';
import { Category } from '@sweetpos/shared-types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const sql = 'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC';
      const categories = await window.electronAPI.dbQuery<any>(sql);
      
      return categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        color: c.color,
        icon: c.icon,
        sortOrder: c.sort_order,
        isActive: Boolean(c.is_active),
      })) as Category[];
    },
  });
};
