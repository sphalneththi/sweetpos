import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { CreateUserDto, UpdateUserDto } from '@sweetpos/shared-types';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find({
      select: ['id', 'username', 'email', 'fullName', 'role', 'isActive', 'lastLogin', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.findByUsername(dto.username);
    if (existing) throw new ConflictException('Username already exists');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email || null,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
    });

    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.email !== undefined) user.email = dto.email || null;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    return this.userRepo.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepo.softDelete(id);
  }

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.update(id, { passwordHash });
  }

  async recordLogin(id: string): Promise<void> {
    await this.userRepo.update(id, {
      lastLogin: new Date(),
      loginAttempts: 0,
      lockedUntil: null,
    });
  }

  async recordFailedLogin(user: UserEntity): Promise<void> {
    const attempts = user.loginAttempts + 1;
    const update: Partial<UserEntity> = { loginAttempts: attempts };

    // Lock after 5 failed attempts for 15 minutes
    if (attempts >= 5) {
      update.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.userRepo.update(user.id, update);
  }

  isLocked(user: UserEntity): boolean {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  }

  // ---- Refresh Tokens ----

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date, deviceInfo?: string): Promise<RefreshTokenEntity> {
    const token = this.refreshTokenRepo.create({
      userId,
      tokenHash,
      expiresAt,
      deviceInfo: deviceInfo || null,
    });
    return this.refreshTokenRepo.save(token);
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepo.findOne({
      where: { tokenHash, revokedAt: undefined },
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.refreshTokenRepo.update(id, { revokedAt: new Date() });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { userId },
      { revokedAt: new Date() },
    );
  }
}
