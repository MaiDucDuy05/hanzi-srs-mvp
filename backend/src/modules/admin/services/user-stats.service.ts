import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { TestAttempt } from '../../test/entities/test-attempt.entity';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../common/enums/subscription.enums';
import { MetricWithChange, ChartDataPoint } from '../dto/admin.dto';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
  ) {}

  async getSummaryStats(): Promise<[MetricWithChange, MetricWithChange]> {
    const totalUsers = await this.userRepo.count({ where: { deletedAt: IsNull() } });
    const activeVip = await this.countActiveVip();

    return [
      { value: totalUsers },
      { value: activeVip },
    ];
  }

  async getAttemptsStats(): Promise<{ value: number; yesterday: number }> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const todayAttempts = await this.attemptRepo.count({
      where: {
        createdAt: Between(startOfToday, startOfTomorrow),
      }
    });

    const yesterdayAttempts = await this.attemptRepo.count({
      where: {
        createdAt: Between(startOfYesterday, startOfToday),
      }
    });

    return {
      value: todayAttempts,
      yesterday: yesterdayAttempts,
    };
  }

  async getRegistrationsChart(days: number): Promise<ChartDataPoint[]> {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const rows = await this.userRepo
      .createQueryBuilder('u')
      .select("TO_CHAR(u.created_at, 'MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= :start', { start })
      .groupBy("TO_CHAR(u.created_at, 'MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return rows.map(r => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  async getAttemptsChart(days: number): Promise<ChartDataPoint[]> {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const rows = await this.attemptRepo
      .createQueryBuilder('a')
      .select("TO_CHAR(a.created_at, 'MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a.created_at >= :start', { start })
      .groupBy("TO_CHAR(a.created_at, 'MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return rows.map(r => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

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
