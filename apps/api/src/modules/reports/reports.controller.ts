import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@sweetpos/shared-types';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('sales')
  getSales(@Query('from') from?: string, @Query('to') to?: string, @Query('groupBy') groupBy?: string) {
    return this.svc.getSalesReport(from, to, groupBy);
  }

  @Get('products')
  getProducts(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getProductsReport(from, to);
  }

  @Get('inventory')
  getInventory() { return this.svc.getInventoryReport(); }
}
