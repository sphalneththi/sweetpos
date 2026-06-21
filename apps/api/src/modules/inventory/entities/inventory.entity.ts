import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { SupplierEntity } from '../../suppliers/entities/supplier.entity';

@Entity('inventory_movements')
export class InventoryMovementEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', name: 'product_id' }) productId: string;
  @Column({ type: 'varchar', length: 30, name: 'movement_type' }) movementType: string;
  @Column({ type: 'decimal', precision: 12, scale: 3 }) quantity: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, name: 'previous_stock' }) previousStock: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, name: 'new_stock' }) newStock: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_cost', nullable: true }) unitCost: number | null;
  @Column({ type: 'uuid', name: 'reference_id', nullable: true }) referenceId: string | null;
  @Column({ type: 'varchar', length: 50, name: 'reference_type', nullable: true }) referenceType: string | null;
  @Column({ type: 'uuid', name: 'supplier_id', nullable: true }) supplierId: string | null;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @Column({ type: 'uuid', name: 'created_by' }) createdBy: string;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;

  @ManyToOne(() => ProductEntity) @JoinColumn({ name: 'product_id' }) product: ProductEntity;
  @ManyToOne(() => UserEntity) @JoinColumn({ name: 'created_by' }) user: UserEntity;
  @ManyToOne(() => SupplierEntity) @JoinColumn({ name: 'supplier_id' }) supplier: SupplierEntity;
}
