import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ExpService } from './exp.service';
import { ActivityService } from './activity.service';
import {
  ExpTransactionType,
  ActivityType,
  ExpRefType,
} from '../../common/enums/achievements.enums';

/** EXP thưởng khi chạm milestone streak. */
const STREAK_MILESTONE_EXP: Record<number, number> = {
  7: 50,
  14: 100,
  30: 200,
};

/**
 * StreakService — cập nhật streak + thưởng EXP milestone (PR-33).
 * - Cập nhật currentStreak/lastActivityDate trong cùng tx với grading.
 * - Milestone 7/14/30 ngày → award EARN_STREAK (bypass daily cap).
 * - Thay thế StudentProgressService.recordActivity (chưa được wire).
 */
@Injectable()
export class StreakService {
  constructor(
    private expService: ExpService,
    private activityService: ActivityService,
  ) {}

  /**
   * Cập nhật streak + kiểm tra milestone. Gọi trong tx grading.
   * @returns streak mới (sau update), hoặc 0 nếu đã record hôm nay.
   */
  async recordActivityAndCheckMilestones(
    em: EntityManager,
    userId: string,
  ): Promise<{ streak: number; milestoneAwarded: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    // Lock user row.
    const rows = await em.query(
      'SELECT current_streak, last_activity_date FROM users WHERE id = $1 FOR UPDATE',
      [userId],
    );
    if (!rows.length) return { streak: 0, milestoneAwarded: 0 };

    const lastDate = rows[0].last_activity_date;
    if (lastDate === today) {
      return { streak: Number(rows[0].current_streak), milestoneAwarded: 0 };
    }

    let newStreak: number;
    if (lastDate === yesterday) {
      newStreak = Number(rows[0].current_streak) + 1;
    } else {
      newStreak = 1;
    }

    await em.query(
      'UPDATE users SET current_streak = $2, last_activity_date = $3 WHERE id = $1',
      [userId, newStreak, today],
    );

    // Milestone check.
    const milestoneExp = STREAK_MILESTONE_EXP[newStreak] ?? 0;
    if (milestoneExp > 0) {
      const idemKey = `streak:${userId}:${today}:${newStreak}`;
      await this.expService.award(
        em, userId, milestoneExp, ExpTransactionType.EARN_STREAK,
        ExpRefType.STREAK, null, idemKey,
      );
      await this.activityService.log(
        em, userId, ActivityType.STREAK_MILESTONE,
        { streak: newStreak }, milestoneExp,
      );
    }

    return { streak: newStreak, milestoneAwarded: milestoneExp };
  }
}
