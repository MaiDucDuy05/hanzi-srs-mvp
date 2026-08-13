import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuditLog } from './entities/admin-audit-log.entity';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AdminAuditLog)
    private readonly auditLogRepo: Repository<AdminAuditLog>,
  ) {}

  async logAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    ipAddress: string,
    details?: {
      oldValue?: Record<string, any>;
      newValue?: Record<string, any>;
      reason?: string;
    },
  ) {
    try {
      const log = this.auditLogRepo.create({
        adminId,
        action,
        targetType,
        targetId,
        ipAddress,
        oldValue: details?.oldValue,
        newValue: details?.newValue,
        reason: details?.reason,
      });
      await this.auditLogRepo.save(log);
    } catch (error) {
      // Chúng ta không throw error ra ngoài để tránh làm hỏng luồng chính
      // nếu việc ghi log thất bại, chỉ log ra console
      this.logger.error(`Failed to create audit log for admin ${adminId}`, error);
    }
  }

  async getLogs(query: { adminId?: string; action?: string; limit?: number; page?: number }) {
    const limit = query.limit || 20;
    const page = query.page || 1;
    const qb = this.auditLogRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.adminId) {
      qb.andWhere('log.adminId = :adminId', { adminId: query.adminId });
    }
    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data: data.map(log => ({
        ...log,
        adminEmail: log.admin?.email,
        adminName: log.admin?.fullName,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}
