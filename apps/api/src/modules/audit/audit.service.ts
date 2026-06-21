import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditAction } from '@sweetpos/shared-types';

interface LogEntry {
  userId?: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  terminalId?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async log(entry: LogEntry): Promise<void> {
    try {
      const log = this.auditRepo.create({
        userId: entry.userId || null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        oldValue: entry.oldValue || null,
        newValue: entry.newValue || null,
        ipAddress: entry.ipAddress || null,
        terminalId: entry.terminalId || null,
      });
      await this.auditRepo.save(log);
    } catch (error) {
      // Audit logging should never break the main flow
      console.error('Audit log failed:', error);
    }
  }

  async findAll(query: {
    page?: number;
    pageSize?: number;
    action?: string;
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;

    const qb = this.auditRepo.createQueryBuilder('log');

    if (query.action) qb.andWhere('log.action = :action', { action: query.action });
    if (query.entityType) qb.andWhere('log.entityType = :entityType', { entityType: query.entityType });
    if (query.userId) qb.andWhere('log.userId = :userId', { userId: query.userId });
    if (query.from) qb.andWhere('log.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('log.createdAt <= :to', { to: query.to });

    qb.orderBy('log.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
