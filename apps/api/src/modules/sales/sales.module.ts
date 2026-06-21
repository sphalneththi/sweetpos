import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity, SaleItemEntity } from './entities/sale-full.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [TypeOrmModule.forFeature([SaleEntity, SaleItemEntity]), ProductsModule, CustomersModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
