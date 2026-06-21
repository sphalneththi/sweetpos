import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CreateUserDto, UpdateUserDto } from '@sweetpos/shared-types';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const { passwordHash, ...result } = user as any;
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const { passwordHash, ...result } = user as any;
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    const { passwordHash, ...result } = user as any;
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  async remove(@Param('id') id: string) {
    await this.usersService.softDelete(id);
    return { message: 'User deleted successfully' };
  }
}
