import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 100 }) name: string;
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true }) @Index() phone: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true }) email: string | null;
  @Column({ type: 'text', nullable: true }) address: string | null;
  @Column({ type: 'int', name: 'loyalty_points', default: 0 }) loyaltyPoints: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_spent', default: 0 }) totalSpent: number;
  @Column({ type: 'int', name: 'visit_count', default: 0 }) visitCount: number;
  @Column({ type: 'timestamptz', name: 'last_visit', nullable: true }) lastVisit: Date | null;
  @Column({ type: 'boolean', name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' }) deletedAt: Date | null;
}
