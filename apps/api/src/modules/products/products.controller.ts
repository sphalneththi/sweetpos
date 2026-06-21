import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, CreateProductDto, UpdateProductDto, PaginationQueryDto } from '@sweetpos/shared-types';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated)' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.productsService.findAll({ ...query, categoryId, isActive });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or barcode' })
  async search(@Query('q') q: string) {
    return this.productsService.search(q || '');
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get low stock products' })
  async getLowStock() {
    return this.productsService.getLowStock();
  }

  @Get('barcode/:code')
  @ApiOperation({ summary: 'Lookup product by barcode' })
  async findByBarcode(@Param('code') code: string) {
    const product = await this.productsService.findByBarcode(code);
    if (!product) return { found: false };
    return { found: true, product };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    return this.productsService.create(dto, userId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate product' })
  async deactivate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.productsService.deactivate(id, userId);
    return { message: 'Product deactivated' };
  }
}
