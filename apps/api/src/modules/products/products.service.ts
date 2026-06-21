import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { ProductEntity, CategoryEntity } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, PaginationQueryDto } from '@sweetpos/shared-types';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@sweetpos/shared-types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: PaginationQueryDto & { categoryId?: string; isActive?: boolean }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;

    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c');

    if (query.search) {
      qb.andWhere('(p.name ILIKE :search OR p.barcode ILIKE :search OR p.sku ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId: query.categoryId });
    if (query.isActive !== undefined) qb.andWhere('p.isActive = :isActive', { isActive: query.isActive });

    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(`p.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(barcode: string): Promise<ProductEntity | null> {
    return this.productRepo.findOne({
      where: { barcode, isActive: true },
      relations: ['category'],
    });
  }

  async search(term: string): Promise<ProductEntity[]> {
    return this.productRepo.find({
      where: [
        { name: ILike(`%${term}%`), isActive: true },
        { barcode: ILike(`%${term}%`), isActive: true },
      ],
      relations: ['category'],
      take: 20,
    });
  }

  async create(dto: CreateProductDto, userId?: string): Promise<ProductEntity> {
    const product = this.productRepo.create({
      barcode: dto.barcode || null,
      sku: dto.sku || null,
      name: dto.name,
      description: dto.description || null,
      categoryId: dto.categoryId || null,
      sellingPrice: dto.sellingPrice,
      costPrice: dto.costPrice,
      stockQuantity: dto.stockQuantity || 0,
      minStockLevel: dto.minStockLevel || 0,
      unitType: dto.unitType || 'piece',
      imageUrl: dto.imageUrl || null,
      taxRate: dto.taxRate || 0,
    });

    const saved = await this.productRepo.save(product);

    await this.auditService.log({
      userId,
      action: AuditAction.CREATE,
      entityType: 'product',
      entityId: saved.id,
      newValue: { name: saved.name, sellingPrice: saved.sellingPrice, costPrice: saved.costPrice },
    });

    return saved;
  }

  async update(id: string, dto: UpdateProductDto, userId?: string): Promise<ProductEntity> {
    const product = await this.findById(id);
    const oldValues = { name: product.name, sellingPrice: product.sellingPrice, costPrice: product.costPrice };

    // Track price changes specially
    const priceChanged = dto.sellingPrice !== undefined && dto.sellingPrice !== product.sellingPrice;

    Object.assign(product, dto);
    const saved = await this.productRepo.save(product);

    if (priceChanged) {
      await this.auditService.log({
        userId,
        action: AuditAction.PRICE_CHANGE,
        entityType: 'product',
        entityId: id,
        oldValue: oldValues,
        newValue: { sellingPrice: saved.sellingPrice, costPrice: saved.costPrice },
      });
    } else {
      await this.auditService.log({
        userId,
        action: AuditAction.UPDATE,
        entityType: 'product',
        entityId: id,
        oldValue: oldValues,
        newValue: { name: saved.name, sellingPrice: saved.sellingPrice },
      });
    }

    return saved;
  }

  async deactivate(id: string, userId?: string): Promise<void> {
    await this.findById(id);
    await this.productRepo.update(id, { isActive: false });
    await this.auditService.log({
      userId,
      action: AuditAction.DELETE,
      entityType: 'product',
      entityId: id,
    });
  }

  async getLowStock(): Promise<ProductEntity[]> {
    return this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.isActive = true')
      .andWhere('p.stockQuantity <= p.minStockLevel')
      .orderBy('p.stockQuantity', 'ASC')
      .getMany();
  }

  async updateStock(productId: string, quantityDelta: number): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update(ProductEntity)
      .set({ stockQuantity: () => `stock_quantity + ${quantityDelta}` })
      .where('id = :id', { id: productId })
      .execute();
  }
}
