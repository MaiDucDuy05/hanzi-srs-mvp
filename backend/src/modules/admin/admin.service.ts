/**
 * AdminService — orchestrator cho dashboard overview.
 * Gọi 3 sub-services (userStats, revenue, health) song song + 2 query riêng:
 * - pendingVipCount: VIP upgrade requests status=PENDING.
 * - pendingSubscriptions: top N VIP active subs + join user fullName cho table.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Subscription } from '../subscription/entities/subscription.entity';
import { VipUpgradeRequest } from '../resources/entities/vip-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import {
  SubscriptionStatus,
  SubscriptionPlan,
} from '../../common/enums/subscription.enums';
import { UpgradeRequestStatus } from '../../common/enums/resources.enums';
import { UserStatsService } from './services/user-stats.service';
import { RevenueService } from './services/revenue.service';
import { HealthService } from './services/health.service';
import { DashboardOverview, PendingSubscriptionItem } from './dto/admin.dto';

/** Số dòng pending subscriptions tối đa trả về cho dashboard table. */
const PENDING_SUBS_LIMIT = 5;

@Injectable()
export class AdminService {
  constructor(
    private userStatsSvc: UserStatsService,
    private revenueSvc: RevenueService,
    private healthSvc: HealthService,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(VipUpgradeRequest)
    private vipReqRepo: Repository<VipUpgradeRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  /** Tổng hợp tất cả stats cho dashboard — 1 round-trip từ frontend. */
  async getOverview(): Promise<DashboardOverview> {
    const [userStats, revenue, health, pendingVipCount, pendingSubscriptions] =
      await Promise.all([
        this.userStatsSvc.getStats(),
        this.revenueSvc.getMetrics(),
        this.healthSvc.getHealth(),
        this.getPendingVipCount(),
        this.getPendingSubscriptions(),
      ]);

    return {
      userStats,
      pendingVipCount,
      revenue,
      health,
      pendingSubscriptions,
    };
  }

  /** Đếm VIP upgrade requests đang chờ admin review. */
  private async getPendingVipCount(): Promise<number> {
    return this.vipReqRepo.count({
      where: { status: UpgradeRequestStatus.PENDING },
    });
  }

  /** Top N VIP active subscriptions gần nhất + user fullName cho dashboard table. */
  private async getPendingSubscriptions(): Promise<PendingSubscriptionItem[]> {
    const subs = await this.subRepo.find({
      where: {
        status: SubscriptionStatus.PENDING_PAYMENT,
        plan: SubscriptionPlan.VIP,
      },
      order: { createdAt: 'DESC' },
      take: PENDING_SUBS_LIMIT,
    });
    if (subs.length === 0) return [];

    // Batch fetch user names — tránh N+1.
    const userIds = [...new Set(subs.map((s) => s.userId))];
    const users = await this.userRepo.find({ where: { id: In(userIds) } });
    const userMap = new Map(users.map((u) => [u.id, u.fullName]));

    return subs.map((s) => ({
      id: s.id,
      userId: s.userId,
      userFullName: userMap.get(s.userId) ?? 'Unknown',
      plan: s.plan,
    }));
  }
}
