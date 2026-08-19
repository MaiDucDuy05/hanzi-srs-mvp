import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserActivity } from './entities/user-activity.entity';
import { ActivityType } from '../../common/enums/achievements.enums';

/**
 * ActivityService — ghi timeline hoạt động (PR-33 ADR-6).
 * Internal service (không controller). Gọi trong cùng tx với grading/redeem.
 * Cron purge xóa rows > 90 ngày (phase 08).
 */
@Injectable()
export class ActivityService {
  /**
   * Ghi 1 dòng activity vào timeline.
   * @param em — EntityManager của caller tx.
   * @param userId — user thực hiện.
   * @param activityType — loại hoạt động.
   * @param details — context thêm (jsonb, vd { rewardCode, cost }).
   * @param expAwarded — EXP cộng/trừ từ hoạt động này (0 nếu không).
   */
  async log(
    em: EntityManager,
    userId: string,
    activityType: ActivityType,
    details: Record<string, unknown> | null = null,
    expAwarded = 0,
  ): Promise<void> {
    const repo = em.getRepository(UserActivity);
    await repo.save(
      repo.create({
        userId,
        activityType,
        details,
        expAwarded,
      }),
    );
  }
}
