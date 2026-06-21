import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(SupplierEntity) private repo: Repository<SupplierEntity>) {}

  async findAll(search?: string) {
    const qb = this.repo.createQueryBuilder('s').where('s.isActive = true');
    if (search) qb.andWhere('(s.name ILIKE :s OR s.phone ILIKE :s)', { s: `%${search}%` });
    return qb.orderBy('s.name', 'ASC').getMany();
  }

  async findById(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async create(dto: any) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: any) {
    const s = await this.findById(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: string) {
    const s = await this.findById(id);
    s.isActive = false;
    await this.repo.save(s);
  }
}
