import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [],
  providers: [],
  exports: [],
})
export class CategoriesModule {}
