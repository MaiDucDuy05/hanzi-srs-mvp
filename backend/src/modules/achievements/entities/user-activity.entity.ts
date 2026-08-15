import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ActivityType } from '../../../common/enums/achievements.enums';

/**
 * Timeline hoạt động người dùng (PR-33). Nguồn cho dashboard/heatmap/radar.
 * - PARTITION BY RANGE(created_at) theo tháng (xem migration 005).
 * - Cron purge xóa rows > 90 ngày (user_activities chỉ).
 * - exp_awarded: EXP cộng từ hoạt động này (0 nếu không cộng).
 */
@Entity('user_activities')
@Index('idx_user_activities_user_created', ['userId', 'createdAt'])
export class UserActivity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'activity_type', type: 'varchar', length: 30 })
  activityType: ActivityType;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ name: 'exp_awarded', type: 'int', default: 0 })
  expAwarded: number;
}
