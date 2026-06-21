import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sweetpos/shared-types';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get('movements')
  getMovements(@Query('productId') productId?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.svc.getMovements(productId, page ? +page : 1, pageSize ? +pageSize : 50);
  }

  @Get('low-stock')
  getLowStock() { return this.svc.getLowStock(); }

  @Post('movement')
  @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  recordMovement(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.svc.recordMovement({ ...dto, createdBy: userId });
  }
}
