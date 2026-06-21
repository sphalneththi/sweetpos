import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  @Index()
  userId: string | null;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  @Index()
  entityType: string;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', name: 'old_value', nullable: true })
  oldValue: Record<string, unknown> | null;

  @Column({ type: 'jsonb', name: 'new_value', nullable: true })
  newValue: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 45, name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 50, name: 'terminal_id', nullable: true })
  terminalId: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Index()
  createdAt: Date;
}
