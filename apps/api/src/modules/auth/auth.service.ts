import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto, LoginResponseDto, AuditAction } from '@sweetpos/shared-types';

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string): Promise<LoginResponseDto> {
    const user = await this.usersService.findByUsername(dto.username);

    if (!user) {
      this.logger.warn(`Login attempt for non-existent user: ${dto.username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (this.usersService.isLocked(user)) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, dto.password);
    if (!isPasswordValid) {
      await this.usersService.recordFailedLogin(user);
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        entityType: 'user',
        entityId: user.id,
        ipAddress,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login
    await this.usersService.recordLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const refreshExpiry = this.configService.get('JWT_REFRESH_EXPIRY', '7d');
    const expiresAt = new Date();
    const days = parseInt(refreshExpiry) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.usersService.saveRefreshToken(user.id, refreshTokenHash, expiresAt);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
    });

    this.logger.log(`User ${user.username} logged in successfully`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role as any,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Find all non-revoked tokens for comparison
    // In production, you'd optimize this with a token family approach
    const user = await this.validateRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.usersService.saveRefreshToken(user.id, newRefreshTokenHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async validateRefreshToken(refreshToken: string): Promise<any> {
    // This is a simplified approach - in production, use token families
    const users = await this.usersService.findAll();
    // For now, we rely on the frontend sending the right token
    // A production implementation would store and look up tokens differently
    return null;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.revokeAllRefreshTokens(userId);
    await this.auditService.log({
      userId,
      action: AuditAction.LOGOUT,
      entityType: 'user',
      entityId: userId,
    });
  }

  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) return null;
    return user;
  }
}
