import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovementEntity } from './entities/inventory.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovementEntity) private repo: Repository<InventoryMovementEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async getMovements(productId?: string, page = 1, pageSize = 50) {
    const qb = this.repo.createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'p')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoinAndSelect('m.supplier', 's');
    if (productId) qb.where('m.productId = :productId', { productId });
    qb.orderBy('m.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getLowStock() {
    return this.productsService.getLowStock();
  }

  async recordMovement(dto: {
    productId: string; movementType: string; quantity: number;
    unitCost?: number; supplierId?: string; notes?: string; createdBy: string;
    referenceId?: string; referenceType?: string;
  }) {
    const product = await this.productsService.findById(dto.productId);
    const previousStock = Number(product.stockQuantity);

    let delta = dto.quantity;
    if (['stock_out', 'damaged', 'sale'].includes(dto.movementType)) delta = -dto.quantity;
    if (dto.movementType === 'adjustment') delta = dto.quantity - previousStock;

    const newStock = previousStock + delta;
    if (newStock < 0) throw new BadRequestException('Insufficient stock');

    await this.productsService.updateStock(dto.productId, delta);

    const movement = this.repo.create({
      productId: dto.productId,
      movementType: dto.movementType,
      quantity: dto.quantity,
      previousStock,
      newStock,
      unitCost: dto.unitCost || null,
      supplierId: dto.supplierId || null,
      notes: dto.notes || null,
      createdBy: dto.createdBy,
      referenceId: dto.referenceId || null,
      referenceType: dto.referenceType || null,
    });
    return this.repo.save(movement);
  }
}
