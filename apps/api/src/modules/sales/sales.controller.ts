import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly svc: SalesService) {}

  @Post()
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.svc.create({ ...dto, cashierId: userId });
  }

  @Get()
  findAll(
    @Query('page') page?: number, @Query('pageSize') pageSize?: number,
    @Query('from') from?: string, @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.findAll({ page: page ? +page : 1, pageSize: pageSize ? +pageSize : 50, from, to, status });
  }

  @Get('summary') getDailySummary(@Query('date') date?: string) { return this.svc.getDailySummary(date); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findById(id); }
  @Post(':id/cancel') cancel(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.svc.cancel(id, userId); }
}
