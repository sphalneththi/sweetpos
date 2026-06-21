import { Controller, Post, Body, UseGuards, Get, Req, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { LoginDto, RefreshTokenDto, ChangePasswordDto } from '@sweetpos/shared-types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  async login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.authService.login(dto, ip);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.id);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findById(user.id);
    const { passwordHash, ...result } = fullUser as any;
    return result;
  }

  @Post('password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    const fullUser = await this.usersService.findById(user.id);
    const isValid = await this.usersService.validatePassword(fullUser, dto.currentPassword);
    if (!isValid) {
      return { error: 'Current password is incorrect' };
    }
    await this.usersService.changePassword(user.id, dto.newPassword);
    return { message: 'Password changed successfully' };
  }
}
