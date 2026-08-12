/**
 * RevenueService — doanh thu tháng = (số VIP active) × VIP_PRICE_MONTHLY (env).
 * Không có bảng payment trong MVP → tính xấp xỉ từ subscription count × giá.
 * revenueTarget đọc từ env REVENUE_TARGET_MONTHLY.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../common/enums/subscription.enums';
import { RevenueMetrics } from '../dto/admin.dto';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private configService: ConfigService,
  ) {}

  async getMetrics(): Promise<RevenueMetrics> {
    const activeVipCount = await this.countActiveVip();
    const price = Number(
      this.configService.get<string>('VIP_PRICE_MONTHLY') ?? 9.99,
    );
    const target = Number(
      this.configService.get<string>('REVENUE_TARGET_MONTHLY') ?? 45000,
    );

    return {
      monthlyRevenue: Math.round(activeVipCount * price * 100) / 100,
      revenueTarget: target,
      currency: 'USD',
    };
  }

  /** DISTINCT users có VIP ACTIVE chưa hết hạn. */
  private async countActiveVip(): Promise<number> {
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
