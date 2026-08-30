import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Queue, Job } from 'bull';
import { DailyPracticeUsage } from './entities/daily-practice-usage.entity';
import { RedisUsageService } from './redis-usage.service';
import { DAILY_USAGE_QUEUE, JOB_FLUSH_USAGE } from '../../common/queue/queue.constants';

/**
 * DailyUsageFlushProcessor — Flush Redis daily usage counters → PostgreSQL.
 *
 * Cron trigger mỗi 5 phút qua @nestjs/schedule. Dùng BullMQ để serialize
 * các flush job (tránh race condition nếu app chạy nhiều instance).
 *
 * Flow:
 *   1. Cron → enqueue JOB_FLUSH_USAGE vào DAILY_USAGE_QUEUE
 *   2. Processor xử lý: scan keys → GETDEL từng key → UPSERT vào PG
 *
 * GETDEL đảm bảo atomic: nếu processor crash giữa chừng, key đã xoá
 * → count đó mất (acceptable: max loss = 5 phút × N attempts).
 * Để đảm bảo cao hơn: dùng Lua script hoặc Redis Stream (future enhancement).
 */
@Injectable()
@Processor(DAILY_USAGE_QUEUE)
export class DailyUsageFlushProcessor {
  private readonly logger = new Logger(DailyUsageFlushProcessor.name);

  constructor(
    private readonly redisUsage: RedisUsageService,
    @InjectRepository(DailyPracticeUsage)
    private readonly usageRepo: Repository<DailyPracticeUsage>,
    @InjectQueue(DAILY_USAGE_QUEUE) private readonly queue: Queue,
  ) {}

  /** Cron mỗi 5 phút — enqueue job để BullMQ serialize. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledFlush() {
    await this.queue.add(JOB_FLUSH_USAGE, {}, {
      removeOnComplete: 10,
      removeOnFail: 5,
    });
    this.logger.debug('Enqueued flush.usage job');
  }

  @Process(JOB_FLUSH_USAGE)
  async handleFlush(job: Job) {
    const keys = await this.redisUsage.scanAllUsageKeys();
    if (keys.length === 0) return;

    this.logger.log(`Flushing ${keys.length} Redis usage keys → PostgreSQL`);
    
    // 1. Lấy toàn bộ data từ Redis trước (chỉ đọc GET, KHÔNG XOÁ để giữ đếm trong ngày)
    const entries: { userId: string, activityKey: string, date: string, count: number }[] = [];
    for (const key of keys) {
      const entry = await this.redisUsage.get(key);
      if (entry) entries.push(entry);
    }

    if (entries.length === 0) return;

    // 2. Gom nhóm (Batching) Bulk UPSERT để không làm nghẽn TypeORM Pool
    const chunkSize = 500;
    let flushed = 0;

    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);

      try {
        await this.usageRepo
          .createQueryBuilder()
          .insert()
          .into(DailyPracticeUsage)
          .values(chunk.map(e => ({
            userId: e.userId,
            activityKey: e.activityKey,
            usageDate: e.date,
            usedCount: e.count,
          })))
          .onConflict('("user_id", "activity_key", "usage_date") DO UPDATE SET used_count = EXCLUDED.used_count')
          .execute();
        
        flushed += chunk.length;
      } catch (err) {
        this.logger.error(
          `Failed to flush usage chunk: ${err?.message}`,
          err?.stack,
        );
      }
    }

    this.logger.log(`Flush complete: ${flushed}/${keys.length} keys written to PostgreSQL`);
    await job.progress(100);
  }
}
