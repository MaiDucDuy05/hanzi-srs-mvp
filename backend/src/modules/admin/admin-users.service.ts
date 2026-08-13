import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role, UserStatus } from '../../common/enums/user.enums';

import { AuditLogService } from './audit-log.service';
import { Subscription } from '../subscription/entities/subscription.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription) private readonly subRepo: Repository<Subscription>,

    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    const qb = this.userRepo.createQueryBuilder('user')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    if (query.role) qb.andWhere('user.role = :role', { role: query.role });
    if (query.status) qb.andWhere('user.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    const [data, total] = await qb.getManyAndCount();

    // Lấy thông tin VIP cho từng user
    const userIds = data.map(u => u.id);
    let subs: Subscription[] = [];
    if (userIds.length > 0) {
      subs = await this.subRepo.createQueryBuilder('sub')
        .where('sub.userId IN (:...userIds)', { userIds })
        .andWhere('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
        .getMany();
    }

    const subsMap = new Map(subs.map(s => [s.userId, s]));

    return {
      data: data.map(u => ({
        ...u,
        passwordHash: undefined,
        vipValidUntil: subsMap.get(u.id)?.expiresAt || null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    const sub = await this.subRepo.findOne({ 
      where: { userId: id, status: SubscriptionStatus.ACTIVE } 
    });

    return {
      ...user,
      passwordHash: undefined,
      vipValidUntil: sub?.expiresAt || null,
    };
  }

  async changeRole(targetId: string, inputRole: string, vipDays: number | undefined, adminId: string, ipAddress: string) {
    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('User not found');

    const oldRole = user.role;
    let newRole = inputRole as Role;
    
    // Xử lý pseudo-role VIP
    const isUpgradingToVip = inputRole === 'VIP';
    if (isUpgradingToVip) {
      newRole = Role.FREE; // User VIP bản chất vẫn có thể là FREE/TEACHER, ta set là FREE tạm (hoặc giữ nguyên role cũ nếu hợp lý, nhưng PR-27 đổi Role -> VIP). Giữ newRole là FREE.
    }

    if (oldRole === Role.ADMIN && targetId === adminId) {
      throw new ForbiddenException('Cannot demote yourself. Ask another admin.');
    }

    if (oldRole === Role.ADMIN && newRole !== Role.ADMIN) {
      const adminCount = await this.userRepo.count({ where: { role: Role.ADMIN, status: UserStatus.ACTIVE } });
      if (adminCount <= 1) {
        throw new ForbiddenException('LAST_ADMIN_PROTECTED: Cannot demote the last active admin.');
      }
    }

    // Cập nhật User Role
    if (user.role !== newRole) {
      user.role = newRole;
      await this.userRepo.save(user);
    }

    // Xử lý Subscriptions (VIP)
    const existingSub = await this.subRepo.findOne({ 
      where: { userId: targetId, status: SubscriptionStatus.ACTIVE, plan: SubscriptionPlan.VIP } 
    });

    if (isUpgradingToVip && vipDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + vipDays);

      if (existingSub) {
        existingSub.expiresAt = expiresAt;
        await this.subRepo.save(existingSub);
      } else {
        const newSub = this.subRepo.create({
          userId: targetId,
          plan: SubscriptionPlan.VIP,
          status: SubscriptionStatus.ACTIVE,
          startsAt: new Date(),
          expiresAt: expiresAt,
        });
        await this.subRepo.save(newSub);
      }
    } else if (!isUpgradingToVip && existingSub) {
      // Đổi sang FREE, TEACHER, ADMIN -> Xoá gói VIP hiện tại (hạ quyền)
      existingSub.status = SubscriptionStatus.CANCELLED;
      await this.subRepo.save(existingSub);
    }

    await this.auditLogService.logAction(
      adminId, 'CHANGE_ROLE', 'USER', targetId, ipAddress,
      { 
        oldValue: { role: oldRole }, 
        newValue: { role: newRole, vipDays: isUpgradingToVip ? vipDays : 0 } 
      }
    );

    return this.findById(targetId);
  }

  async banUser(targetId: string, reason: string, adminId: string, ipAddress: string) {
    if (targetId === adminId) throw new ForbiddenException('CANNOT_BAN_SELF');

    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === Role.ADMIN) {
      const adminCount = await this.userRepo.count({ where: { role: Role.ADMIN, status: UserStatus.ACTIVE } });
      if (adminCount <= 1) {
        throw new ForbiddenException('LAST_ADMIN_PROTECTED: Cannot ban the last active admin.');
      }
    }

    const oldStatus = user.status;
    user.status = UserStatus.BANNED;
    user.banReason = reason;
    user.bannedAt = new Date();
    user.bannedBy = adminId;
    await this.userRepo.save(user);

    // Đã gỡ Redis: Việc ban dựa hoàn toàn vào DB thông qua JWT Strategy

    await this.auditLogService.logAction(
      adminId, 'BAN_USER', 'USER', targetId, ipAddress,
      { oldValue: { status: oldStatus }, newValue: { status: user.status }, reason }
    );

    return user;
  }

  async unbanUser(targetId: string, adminId: string, ipAddress: string) {
    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('User not found');

    const oldStatus = user.status;
    user.status = UserStatus.ACTIVE;
    user.banReason = null;
    user.bannedAt = null;
    user.bannedBy = null;
    await this.userRepo.save(user);

    // Đã gỡ Redis

    await this.auditLogService.logAction(
      adminId, 'UNBAN_USER', 'USER', targetId, ipAddress,
      { oldValue: { status: oldStatus }, newValue: { status: user.status } }
    );

    return user;
  }
}
