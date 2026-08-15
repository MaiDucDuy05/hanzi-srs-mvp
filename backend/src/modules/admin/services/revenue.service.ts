import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../common/enums/subscription.enums';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private configService: ConfigService,
  ) {}

  async getSummaryRevenue(): Promise<{ value: number; lastMonth: number }> {
    const price = Number(this.configService.get<string>('VIP_PRICE_MONTHLY') ?? 9.99);

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // active sub created this month
    const thisMonthSubs = await this.subRepo.count({
      where: {
        plan: SubscriptionPlan.VIP,
        status: SubscriptionStatus.ACTIVE,
        createdAt: Between(firstDayThisMonth, firstDayNextMonth),
      }
    });

    const lastMonthSubs = await this.subRepo.count({
      where: {
        plan: SubscriptionPlan.VIP,
        status: SubscriptionStatus.ACTIVE,
        createdAt: Between(firstDayLastMonth, firstDayThisMonth),
      }
    });

    return {
      value: Math.round(thisMonthSubs * price * 100) / 100,
      lastMonth: Math.round(lastMonthSubs * price * 100) / 100,
    };
  }
}
