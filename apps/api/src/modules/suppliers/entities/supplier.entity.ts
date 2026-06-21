import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('suppliers')
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 100 }) name: string;
  @Column({ type: 'varchar', length: 100, name: 'contact_person', nullable: true }) contactPerson: string | null;
  @Column({ type: 'varchar', length: 20, nullable: true }) phone: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string | null;
  @Column({ type: 'text', nullable: true }) address: string | null;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @Column({ type: 'boolean', name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' }) deletedAt: Date | null;
}
