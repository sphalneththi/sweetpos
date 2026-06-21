import { useQuery } from '@tanstack/react-query';
import { Product } from '@sweetpos/shared-types';

export const useProducts = (categoryId?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['products', categoryId, searchQuery],
    queryFn: async () => {
      let sql = 'SELECT * FROM products WHERE is_active = 1';
      const params: any[] = [];

      if (categoryId && categoryId !== 'all') {
        sql += ' AND category_id = ?';
        params.push(categoryId);
      }

      if (searchQuery) {
        sql += ' AND (name LIKE ? OR barcode LIKE ?)';
        const likeQuery = `%${searchQuery}%`;
        params.push(likeQuery, likeQuery);
      }

      const products = await window.electronAPI.dbQuery<any>(sql, params);
      
      // Map SQLite row snake_case back to camelCase for the frontend
      return products.map(p => ({
        id: p.id,
        barcode: p.barcode,
        sku: p.sku,
        name: p.name,
        description: p.description,
        categoryId: p.category_id,
        sellingPrice: p.selling_price,
        costPrice: p.cost_price,
        stockQuantity: p.stock_quantity,
        minStockLevel: p.min_stock_level,
        unitType: p.unit_type,
        imageUrl: p.image_url,
        taxRate: p.tax_rate,
        isActive: Boolean(p.is_active),
      })) as Product[];
    },
  });
};
