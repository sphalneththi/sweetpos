import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SaleEntity, SaleItemEntity } from './entities/sale-full.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@sweetpos/shared-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SaleEntity) private saleRepo: Repository<SaleEntity>,
    @InjectRepository(SaleItemEntity) private itemRepo: Repository<SaleItemEntity>,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await this.saleRepo.count();
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: {
    cashierId: string; customerId?: string; terminalId?: string;
    items: Array<{ productId: string; quantity: number; discountAmount?: number }>;
    discountType?: string; discountValue?: number; discountAmount?: number;
    paymentMethod: string; cashReceived?: number; loyaltyRedeemed?: number; notes?: string;
  }) {
    const result = await this.dataSource.transaction(async (manager) => {
      // Validate items & calculate totals
      let subtotal = 0;
      const saleItems: Partial<SaleItemEntity>[] = [];

      for (const item of dto.items) {
        const product = await this.productsService.findById(item.productId);
        if (Number(product.stockQuantity) < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }
        const lineTotal = Number(product.sellingPrice) * item.quantity - (item.discountAmount || 0);
        const taxAmount = lineTotal * (Number(product.taxRate) / 100);
        subtotal += lineTotal;
        saleItems.push({
          productId: product.id,
          productName: product.name,
          productBarcode: product.barcode,
          quantity: item.quantity,
          unitPrice: Number(product.sellingPrice),
          costPrice: Number(product.costPrice),
          discountAmount: item.discountAmount || 0,
          taxAmount,
          totalPrice: lineTotal,
        });
      }

      const discountAmount = dto.discountAmount || 0;
      const taxAmount = saleItems.reduce((s, i) => s + (i.taxAmount || 0), 0);
      const totalAmount = subtotal - discountAmount + taxAmount - (dto.loyaltyRedeemed || 0);
      const changeAmount = dto.cashReceived ? Math.max(0, dto.cashReceived - totalAmount) : null;
      const loyaltyEarned = Math.floor(totalAmount / 100); // 1 point per 100 LKR

      const invoiceNumber = await this.generateInvoiceNumber();

      const sale = manager.create(SaleEntity, {
        invoiceNumber,
        terminalId: dto.terminalId || 'WEB-01',
        cashierId: dto.cashierId,
        customerId: dto.customerId || null,
        subtotal,
        discountAmount,
        discountType: dto.discountType || null,
        discountValue: dto.discountValue || 0,
        taxAmount,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        cashReceived: dto.cashReceived || null,
        changeAmount,
        loyaltyEarned,
        loyaltyRedeemed: dto.loyaltyRedeemed || 0,
        status: 'completed',
        notes: dto.notes || null,
      });

      const savedSale = await manager.save(SaleEntity, sale);

      for (const item of saleItems) {
        await manager.save(SaleItemEntity, { ...item, saleId: savedSale.id });
      }

      // Deduct stock
      for (const item of dto.items) {
        await manager.createQueryBuilder().update('products')
          .set({ stockQuantity: () => `stock_quantity - ${item.quantity}` })
          .where('id = :id', { id: item.productId }).execute();
      }

      // Update customer loyalty
      if (dto.customerId) {
        try {
          await this.customersService.addLoyaltyPoints(dto.customerId, loyaltyEarned, totalAmount);
          if (dto.loyaltyRedeemed) {
            await this.customersService.redeemLoyaltyPoints(dto.customerId, dto.loyaltyRedeemed);
          }
        } catch (e) {
          // Loyalty update failure should not block sale
          console.error('Loyalty update failed:', e);
        }
      }

      try {
        await this.auditService.log({ userId: dto.cashierId, action: AuditAction.SALE, entityType: 'sale', entityId: savedSale.id, newValue: { invoiceNumber, totalAmount } });
      } catch (e) {
        console.error('Audit log failed:', e);
      }

      return savedSale;
    });

    // Load full sale with relations after transaction commits
    return this.findById(result.id);
  }

  async findAll(query: { page?: number; pageSize?: number; cashierId?: string; from?: string; to?: string; status?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const qb = this.saleRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.cashier', 'u')
      .leftJoinAndSelect('s.customer', 'c')
      .leftJoinAndSelect('s.items', 'i');
    if (query.cashierId) qb.andWhere('s.cashierId = :cashierId', { cashierId: query.cashierId });
    if (query.status) qb.andWhere('s.status = :status', { status: query.status });
    if (query.from) qb.andWhere('s.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('s.createdAt <= :to', { to: query.to });
    qb.orderBy('s.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['cashier', 'customer', 'items'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async cancel(id: string, userId: string) {
    const sale = await this.findById(id);
    if (sale.status !== 'completed') throw new BadRequestException('Only completed sales can be cancelled');
    sale.status = 'cancelled';
    await this.saleRepo.save(sale);
    // Restock items
    for (const item of sale.items) {
      await this.productsService.updateStock(item.productId, item.quantity);
    }
    await this.auditService.log({ userId, action: AuditAction.REFUND, entityType: 'sale', entityId: id });
    return sale;
  }

  async getDailySummary(date?: string) {
    const day = date ? new Date(date) : new Date();
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(day); end.setHours(23, 59, 59, 999);
    const result = await this.saleRepo.createQueryBuilder('s')
      .select(['COUNT(*) as count', 'SUM(s.totalAmount) as revenue', 'SUM(s.taxAmount) as tax', 'SUM(s.discountAmount) as discount'])
      .where('s.status = :status', { status: 'completed' })
      .andWhere('s.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();
    return result;
  }
}
