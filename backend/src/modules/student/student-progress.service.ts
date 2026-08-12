import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { PracticeAttemptStatus } from '../../common/enums/practice.enums';

export interface StudentProgress {
  dailyXp: number;
  dailyGoal: number;
  progressPercent: number;
  currentStreak: number;
}

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
  ) {}

  async getProgress(userId: string): Promise<StudentProgress> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Today's XP: sum score from completed attempts since midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await this.attemptRepo
      .createQueryBuilder('pa')
      .select('COALESCE(SUM(pa.score), 0)', 'totalXp')
      .where('pa.user_id = :userId', { userId })
      .andWhere('pa.status = :status', {
        status: PracticeAttemptStatus.COMPLETED,
      })
      .andWhere('pa.created_at >= :today', { today })
      .getRawOne<{ totalXp: string }>();

    const dailyXp = parseInt(result?.totalXp ?? '0', 10);
    const dailyGoal = user.dailyGoal || 50;
    const progressPercent = Math.min(
      Math.round((dailyXp / dailyGoal) * 100),
      100,
    );

    // Streak: count consecutive days with completed practice starting from yesterday
    const streak = await this.calculateStreak(userId, user);

    return { dailyXp, dailyGoal, progressPercent, currentStreak: streak };
  }

  private async calculateStreak(userId: string, user: User): Promise<number> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayStr = this.toDateStr(today);
    const yesterdayStr = this.toDateStr(yesterday);

    // If last activity is neither today nor yesterday, streak is 0
    if (
      user.lastActivityDate !== todayStr &&
      user.lastActivityDate !== yesterdayStr
    ) {
      return 0;
    }

    // Count consecutive days backward from today (inclusive)
    let streak = 0;
    const cursor = new Date(today);

    while (true) {
      const dayStart = new Date(cursor);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);

      const hasActivity = await this.attemptRepo
        .createQueryBuilder('pa')
        .select('1')
        .where('pa.user_id = :userId', { userId })
        .andWhere('pa.status = :status', {
          status: PracticeAttemptStatus.COMPLETED,
        })
        .andWhere('pa.created_at >= :start', { start: dayStart })
        .andWhere('pa.created_at <= :end', { end: dayEnd })
        .limit(1)
        .getExists();

      if (!hasActivity) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  /**
   * Update user's streak and last activity date.
   * Called by PracticeService after a session is completed.
   */
  async recordActivity(userId: string): Promise<void> {
    const today = this.toDateStr(new Date());
    const yesterday = this.toDateStr(new Date(Date.now() - 86_400_000));
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return;

    const lastDate = user.lastActivityDate;

    if (lastDate === today) {
      // Already recorded today, no change
      return;
    }

    if (lastDate === yesterday) {
      // Continuing streak
      user.currentStreak += 1;
    } else if (!lastDate || lastDate < yesterday) {
      // Streak broken or first activity
      user.currentStreak = 1;
    }

    user.lastActivityDate = today;
    await this.userRepo.save(user);
  }

  private toDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
