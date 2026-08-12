/**
 * UserStatsService — đếm người dùng theo role + số VIP active.
 * - count by role: GROUP BY trên users (deletedAt IS NULL).
 * - vipCount: DISTINCT userId có subscription plan=VIP, status=ACTIVE, chưa hết hạn.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Role } from '../../../common/enums/user.enums';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../common/enums/subscription.enums';
import { UserStats } from '../dto/admin.dto';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
  ) {}

  /** Đếm user theo role (soft-deleted excluded) + VIP active count. */
  async getStats(): Promise<UserStats> {
    const rows = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('u.deletedAt IS NULL')
      .groupBy('u.role')
      .getRawMany<{ role: Role; count: string }>();

    const byRole: Record<Role, number> = {
      [Role.FREE]: 0,
      [Role.TEACHER]: 0,
      [Role.ADMIN]: 0,
    };
    let total = 0;
    for (const r of rows) {
      const c = Number(r.count);
      byRole[r.role] = c;
      total += c;
    }

    const vipCount = await this.countActiveVip();
    return { total, byRole, vipCount };
  }

  /** DISTINCT users có VIP ACTIVE chưa hết hạn (expiresAt null hoặc > now). */
  async countActiveVip(): Promise<number> {
    const row = await this.subRepo
      .createQueryBuilder('s')
      .select('COUNT(DISTINCT s.userId)', 'count')
      .where('s.plan = :plan', { plan: SubscriptionPlan.VIP })
      .andWhere('s.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('(s.expiresAt IS NULL OR s.expiresAt > now())')
      .getRawOne<{ count: string }>();
    return Number(row?.count ?? 0);
  }
}
