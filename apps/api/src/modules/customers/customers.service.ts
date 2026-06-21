import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(CustomerEntity) private repo: Repository<CustomerEntity>) {}

  async findAll(search?: string, page = 1, pageSize = 50) {
    const qb = this.repo.createQueryBuilder('c').where('c.isActive = true');
    if (search) qb.andWhere('(c.name ILIKE :s OR c.phone ILIKE :s OR c.email ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('c.name', 'ASC').skip((page - 1) * pageSize).take(pageSize);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async findByPhone(phone: string) {
    return this.repo.findOne({ where: { phone } });
  }

  async create(dto: { name: string; phone?: string; email?: string; address?: string }) {
    if (dto.phone) {
      const ex = await this.repo.findOne({ where: { phone: dto.phone } });
      if (ex) throw new ConflictException('Phone number already registered');
    }
    const c = this.repo.create(dto);
    return this.repo.save(c);
  }

  async update(id: string, dto: Partial<{ name: string; phone: string; email: string; address: string; isActive: boolean }>) {
    const c = await this.findById(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async addLoyaltyPoints(id: string, points: number, spent: number) {
    await this.repo.createQueryBuilder().update(CustomerEntity)
      .set({
        loyaltyPoints: () => `loyalty_points + ${points}`,
        totalSpent: () => `total_spent + ${spent}`,
        visitCount: () => `visit_count + 1`,
        lastVisit: new Date(),
      })
      .where('id = :id', { id }).execute();
  }

  async redeemLoyaltyPoints(id: string, points: number) {
    const c = await this.findById(id);
    if (c.loyaltyPoints < points) throw new Error('Insufficient loyalty points');
    await this.repo.update(id, { loyaltyPoints: c.loyaltyPoints - points });
  }
}
