import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity, SaleItemEntity } from './entities/sale.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([SaleEntity, SaleItemEntity]), ProductsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class SalesModule {}
