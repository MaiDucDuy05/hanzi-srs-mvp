import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Bộ đếm lượt luyện tập theo ngày (PR-14).
 * activity_key = practiceType:sourceType:sourceId.
 * UNIQUE (user_id, activity_key, usage_date). Sang ngày mới tự dùng bản ghi mới,
 * không cần job reset. Dọn dữ liệu >90 ngày định kỳ.
 */
@Entity('daily_practice_usage')
export class DailyPracticeUsage extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'activity_key', type: 'varchar', length: 255 })
  activityKey: string;

  @Column({ name: 'usage_date', type: 'date' })
  usageDate: string;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;
}
