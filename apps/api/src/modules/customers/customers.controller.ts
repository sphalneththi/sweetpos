import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly svc: CustomersService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.svc.findAll(search, page ? +page : 1, pageSize ? +pageSize : 50);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findById(id); }
  @Post() create(@Body() dto: any) { return this.svc.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
}
