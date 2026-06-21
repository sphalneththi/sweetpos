import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from '../sales/entities/sale-full.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { CustomerEntity } from '../customers/entities/customer.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SaleEntity) private saleRepo: Repository<SaleEntity>,
    @InjectRepository(ProductEntity) private productRepo: Repository<ProductEntity>,
    @InjectRepository(CustomerEntity) private customerRepo: Repository<CustomerEntity>,
  ) {}

  async getAdminDashboard() {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayStats, monthStats, totalProducts, lowStockItems, outOfStockItems, topProducts, revenueTrend] = await Promise.all([
      this.saleRepo.createQueryBuilder('s')
        .select(['COUNT(*)::int as count', 'COALESCE(SUM(s.totalAmount),0)::float as revenue'])
        .where('s.status = :s', { s: 'completed' })
        .andWhere('s.createdAt BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
        .getRawOne(),
      this.saleRepo.createQueryBuilder('s')
        .select(['COALESCE(SUM(s.totalAmount),0)::float as revenue'])
        .where('s.status = :s', { s: 'completed' })
        .andWhere('s.createdAt >= :start', { start: monthStart })
        .getRawOne(),
      this.productRepo.count({ where: { isActive: true } }),
      this.productRepo.createQueryBuilder('p').where('p.isActive = true AND p.stockQuantity > 0 AND p.stockQuantity <= p.minStockLevel').getCount(),
      this.productRepo.count({ where: { isActive: true, stockQuantity: 0 } as any }),
      this.saleRepo.createQueryBuilder('s')
        .innerJoin('s.items', 'i')
        .select(['i.productName as "productName"', 'SUM(i.quantity)::float as qty', 'SUM(i.totalPrice)::float as revenue'])
        .where('s.status = :s', { s: 'completed' })
        .andWhere('s.createdAt >= :start', { start: monthStart })
        .groupBy('i.productName').orderBy('qty', 'DESC').limit(5).getRawMany(),
      this.saleRepo.createQueryBuilder('s')
        .select(["DATE(s.createdAt) as date", 'COALESCE(SUM(s.totalAmount),0)::float as revenue'])
        .where('s.status = :s', { s: 'completed' })
        .andWhere('s.createdAt >= :start', { start: new Date(now.getTime() - 29 * 86400000) })
        .groupBy('DATE(s.createdAt)').orderBy('date', 'ASC').getRawMany(),
    ]);

    return {
      todaySales: todayStats?.revenue || 0,
      todayTransactions: todayStats?.count || 0,
      monthlySales: monthStats?.revenue || 0,
      totalProducts,
      lowStockItems,
      outOfStockItems,
      topProducts: topProducts.map(p => ({ productName: p.productName, quantity: p.qty, revenue: p.revenue })),
      revenueTrend: revenueTrend.map(r => ({ date: r.date, revenue: r.revenue })),
    };
  }

  async getCashierDashboard(cashierId: string) {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);

    const stats = await this.saleRepo.createQueryBuilder('s')
      .select(['COUNT(*)::int as count', 'COALESCE(SUM(s.totalAmount),0)::float as revenue', 'COALESCE(AVG(s.totalAmount),0)::float as avg'])
      .where('s.cashierId = :cashierId AND s.status = :s', { cashierId, s: 'completed' })
      .andWhere('s.createdAt BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
      .getRawOne();

    return {
      todaySales: stats?.revenue || 0,
      todayTransactions: stats?.count || 0,
      averageTransactionValue: stats?.avg || 0,
    };
  }
}
