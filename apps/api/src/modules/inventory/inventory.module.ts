import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovementEntity } from './entities/inventory.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovementEntity]), ProductsModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
