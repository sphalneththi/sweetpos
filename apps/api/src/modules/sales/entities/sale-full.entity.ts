import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';

@Entity('sales')
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 30, name: 'invoice_number', unique: true }) @Index() invoiceNumber: string;
  @Column({ type: 'varchar', length: 50, name: 'terminal_id', default: 'WEB-01' }) terminalId: string;
  @Column({ type: 'uuid', name: 'cashier_id' }) cashierId: string;
  @Column({ type: 'uuid', name: 'customer_id', nullable: true }) customerId: string | null;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) subtotal: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'discount_amount', default: 0 }) discountAmount: number;
  @Column({ type: 'varchar', length: 20, name: 'discount_type', nullable: true }) discountType: string | null;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'discount_value', default: 0 }) discountValue: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'tax_amount', default: 0 }) taxAmount: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_amount' }) totalAmount: number;
  @Column({ type: 'varchar', length: 30, name: 'payment_method', default: 'cash' }) paymentMethod: string;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'cash_received', nullable: true }) cashReceived: number | null;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'change_amount', nullable: true }) changeAmount: number | null;
  @Column({ type: 'int', name: 'loyalty_earned', default: 0 }) loyaltyEarned: number;
  @Column({ type: 'int', name: 'loyalty_redeemed', default: 0 }) loyaltyRedeemed: number;
  @Column({ type: 'varchar', length: 20, default: 'completed' }) status: string;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' }) updatedAt: Date;

  @ManyToOne(() => UserEntity) @JoinColumn({ name: 'cashier_id' }) cashier: UserEntity;
  @ManyToOne(() => CustomerEntity) @JoinColumn({ name: 'customer_id' }) customer: CustomerEntity;
  @OneToMany(() => SaleItemEntity, (item) => item.sale, { cascade: true }) items: SaleItemEntity[];
}

@Entity('sale_items')
export class SaleItemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', name: 'sale_id' }) saleId: string;
  @Column({ type: 'uuid', name: 'product_id' }) productId: string;
  @Column({ type: 'varchar', length: 200, name: 'product_name' }) productName: string;
  @Column({ type: 'varchar', length: 50, name: 'product_barcode', nullable: true }) productBarcode: string | null;
  @Column({ type: 'decimal', precision: 12, scale: 3 }) quantity: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_price' }) unitPrice: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'cost_price' }) costPrice: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'discount_amount', default: 0 }) discountAmount: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'tax_amount', default: 0 }) taxAmount: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_price' }) totalPrice: number;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;

  @ManyToOne(() => SaleEntity, (sale) => sale.items) @JoinColumn({ name: 'sale_id' }) sale: SaleEntity;
}
