import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@sweetpos/shared-types';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findById(id); }

  @Post() @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  create(@Body() dto: any) { return this.svc.create(dto); }

  @Put(':id') @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }

  @Delete(':id') @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
