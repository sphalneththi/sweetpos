import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from '../sales/entities/sale-full.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { InventoryMovementEntity } from '../inventory/entities/inventory.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SaleEntity) private saleRepo: Repository<SaleEntity>,
    @InjectRepository(ProductEntity) private productRepo: Repository<ProductEntity>,
    @InjectRepository(InventoryMovementEntity) private invRepo: Repository<InventoryMovementEntity>,
  ) {}

  async getSalesReport(from?: string, to?: string, groupBy = 'day') {
    const start = from ? new Date(from) : new Date(Date.now() - 29 * 86400000);
    const end = to ? new Date(to) : new Date();

    const groupExpr = groupBy === 'month' ? "TO_CHAR(s.createdAt,'YYYY-MM')"
      : groupBy === 'week' ? "TO_CHAR(DATE_TRUNC('week',s.createdAt),'YYYY-MM-DD')"
      : "DATE(s.createdAt)";

    const trend = await this.saleRepo.createQueryBuilder('s')
      .select([`${groupExpr} as period`, 'COUNT(*)::int as transactions', 'COALESCE(SUM(s.totalAmount),0)::float as revenue', 'COALESCE(SUM(s.discountAmount),0)::float as discount', 'COALESCE(SUM(s.taxAmount),0)::float as tax'])
      .where('s.status = :status AND s.createdAt BETWEEN :start AND :end', { status: 'completed', start, end })
      .groupBy('period').orderBy('period', 'ASC').getRawMany();

    const totals = await this.saleRepo.createQueryBuilder('s')
      .select(['COUNT(*)::int as transactions', 'COALESCE(SUM(s.totalAmount),0)::float as revenue', 'COALESCE(AVG(s.totalAmount),0)::float as avgTransaction'])
      .where('s.status = :status AND s.createdAt BETWEEN :start AND :end', { status: 'completed', start, end })
      .getRawOne();

    const paymentBreakdown = await this.saleRepo.createQueryBuilder('s')
      .select(['s.paymentMethod as method', 'COUNT(*)::int as count', 'COALESCE(SUM(s.totalAmount),0)::float as amount'])
      .where('s.status = :status AND s.createdAt BETWEEN :start AND :end', { status: 'completed', start, end })
      .groupBy('s.paymentMethod').getRawMany();

    return { trend, totals, paymentBreakdown };
  }

  async getProductsReport(from?: string, to?: string) {
    const start = from ? new Date(from) : new Date(Date.now() - 29 * 86400000);
    const end = to ? new Date(to) : new Date();

    return this.saleRepo.createQueryBuilder('s')
      .innerJoin('s.items', 'i')
      .select(['i.productId as "productId"', 'i.productName as "productName"', 'SUM(i.quantity)::float as qty', 'SUM(i.totalPrice)::float as revenue', 'SUM(i.costPrice * i.quantity)::float as cost'])
      .where('s.status = :status AND s.createdAt BETWEEN :start AND :end', { status: 'completed', start, end })
      .groupBy('i.productId, i.productName').orderBy('revenue', 'DESC').limit(100).getRawMany();
  }

  async getInventoryReport() {
    const products = await this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.isActive = true')
      .orderBy('p.stockQuantity', 'ASC')
      .getMany();

    return products.map(p => ({
      id: p.id, name: p.name,
      category: p.category?.name,
      stockQuantity: p.stockQuantity,
      minStockLevel: p.minStockLevel,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stockValue: Number(p.stockQuantity) * Number(p.costPrice),
      status: Number(p.stockQuantity) <= 0 ? 'out' : Number(p.stockQuantity) <= Number(p.minStockLevel) ? 'low' : 'ok',
    }));
  }
}
