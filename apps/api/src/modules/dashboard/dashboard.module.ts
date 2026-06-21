import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from '../sales/entities/sale-full.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleEntity, ProductEntity, CustomerEntity])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
