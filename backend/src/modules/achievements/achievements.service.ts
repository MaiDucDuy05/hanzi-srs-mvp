import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from './entities/user-activity.entity';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { PracticeAttemptStatus } from '../../common/enums/practice.enums';
import { ExpDailyEarnings } from './entities/exp-daily-earnings.entity';
import { getLevel } from './utils/level.util';
import { ActivityType } from '../../common/enums/achievements.enums';

/**
 * AchievementsService — đọc dashboard/timeline/heatmap/radar (PR-33).
 * Read-only queries, không ghi. Ghi qua ExpService/ActivityService.
 */
@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(UserActivity)
    private activityRepo: Repository<UserActivity>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
    @InjectRepository(ExpDailyEarnings)
    private dailyEarningsRepo: Repository<ExpDailyEarnings>,
  ) {}

  /** Dashboard: balance + level + streak + recent activities. */
  async getDashboard(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'currentExp', 'totalExp', 'currentStreak', 'dailyGoal'],
    });
    if (!user) return null;

    const level = getLevel(user.totalExp);
    const recentActivities = await this.activityRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const todayDate = new Date().toISOString().split('T')[0];
    const dailyEarnings = await this.dailyEarningsRepo.findOne({
      where: { userId, date: todayDate },
      select: ['earned'],
    });
    const dailyXp = dailyEarnings?.earned ?? 0;
    
    // progressPercent is capped at 100%
    const progressPercent = Math.min(Math.round((dailyXp / (user.dailyGoal || 50)) * 100), 100);

    return {
      balance: { current: user.currentExp, total: user.totalExp },
      level,
      streak: user.currentStreak,
      dailyGoal: user.dailyGoal || 50,
      dailyXp,
      progressPercent,
      recentActivities,
    };
  }

  /** Timeline: hoạt động theo khoảng (week/month), phân trang. */
  async getTimeline(userId: string, range: 'week' | 'month' = 'month', page = 1, limit = 20) {
    const days = range === 'week' ? 7 : 30;
    const since = new Date(Date.now() - days * 86_400_000);

    const [data, total] = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.created_at >= :since', { since })
      .orderBy('a.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Heatmap: số hoạt động mỗi ngày (90 ngày gần nhất, GitHub-style). */
  async getHeatmap(userId: string) {
    const result = await this.activityRepo
      .createQueryBuilder('a')
      .select("to_char(a.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('count(*)', 'count')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.created_at >= :since', { since: new Date(Date.now() - 90 * 86_400_000) })
      .groupBy("to_char(a.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((r: any) => ({ date: r.date, count: Number(r.count) }));
  }

  /** Radar: phân bố attempt theo practice_type (skill distribution). */
  async getRadar(userId: string) {
    const result = await this.attemptRepo
      .createQueryBuilder('pa')
      .select('pa.practice_type', 'type')
      .addSelect('count(*)', 'count')
      .addSelect('avg(pa.correct_count)', 'avgCorrect')
      .where('pa.user_id = :userId', { userId })
      .andWhere('pa.status = :status', { status: PracticeAttemptStatus.COMPLETED })
      .groupBy('pa.practice_type')
      .getRawMany();

    return result.map((r: any) => ({
      type: r.type,
      count: Number(r.count),
      avgCorrect: Math.round(Number(r.avgCorrect) * 100) / 100,
    }));
  }
}
