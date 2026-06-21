import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  role: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', name: 'last_login', nullable: true })
  lastLogin: Date | null;

  @Column({ type: 'int', name: 'login_attempts', default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}
