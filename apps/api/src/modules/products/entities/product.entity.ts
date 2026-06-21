import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  @Index()
  barcode: string | null;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'selling_price' })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'cost_price' })
  costPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, name: 'min_stock_level', default: 0 })
  minStockLevel: number;

  @Column({ type: 'varchar', length: 20, name: 'unit_type', default: 'piece' })
  unitType: string;

  @Column({ type: 'varchar', length: 500, name: 'image_url', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'tax_rate', default: 0 })
  taxRate: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
