import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

/**
 * ActivityPurgeService — dọn rác timeline (PR-33).
 * Cron 3h sáng daily: xóa user_activities > 90 ngày.
 * KHÔNG xóa exp_transactions (ledger đối soát vĩnh viễn).
 * users.total_exp/current_exp không bị ảnh hưởng (cache + ledger nguyên vẹn).
 */
@Injectable()
export class ActivityPurgeService {
  private readonly logger = new Logger(ActivityPurgeService.name);
  private readonly retentionDays = 90;

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Xóa user_activities cũ hơn 90 ngày.
   * Chạy cron 3h sáng. Return số rows đã xóa.
   */
  @Cron('0 3 * * *', { name: 'purge-user-activities' })
  async purgeOldActivities(): Promise<number> {
    const result = await this.dataSource.query(
      `DELETE FROM user_activities WHERE created_at < NOW() - INTERVAL '${this.retentionDays} days'`,
    );
    const deleted = Array.isArray(result) ? result[1] ?? 0 : 0;
    this.logger.log(`Purged ${deleted} user_activities older than ${this.retentionDays} days.`);
    return deleted;
  }
}
