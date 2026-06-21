import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from '../sales/entities/sale-full.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { InventoryMovementEntity } from '../inventory/entities/inventory.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleEntity, ProductEntity, InventoryMovementEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
