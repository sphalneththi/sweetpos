import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../products/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(CategoryEntity) private repo: Repository<CategoryEntity>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findById(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: { name: string; description?: string; color?: string; icon?: string; sortOrder?: number }) {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Category name already exists');
    const cat = this.repo.create({ ...dto, sortOrder: dto.sortOrder ?? 0 });
    return this.repo.save(cat);
  }

  async update(id: string, dto: Partial<{ name: string; description: string; color: string; icon: string; sortOrder: number; isActive: boolean }>) {
    const cat = await this.findById(id);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.findById(id);
    cat.isActive = false;
    await this.repo.save(cat);
  }
}
