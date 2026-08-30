import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

/**
 * RedisUsageService — Atomic counter cho daily practice quota dùng Redis INCR.
 *
 * Dùng IORedis connection RIÊNG (không qua cache-manager) để đảm bảo truy cập
 * trực tiếp INCR/GETDEL/SCAN mà cache-manager không expose.
 *
 * Key schema: `daily_usage:{userId}:{activityKey}:{YYYY-MM-DD}`
 * TTL: 25h — đủ bao cho múi giờ UTC+7, tự hết hạn vào ngày mai.
 */
@Injectable()
export class RedisUsageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisUsageService.name);
  private client: IORedis | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL không set — RedisUsageService disabled, fallback sang PG lock');
      return;
    }
    try {
      this.client = new IORedis(redisUrl, {
        maxRetriesPerRequest: 2,
        connectTimeout: 2000,
        lazyConnect: false,
      });
      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err?.message}`);
      });
      this.logger.log('RedisUsageService connected to Redis');
    } catch (err) {
      this.logger.warn(`Failed to init Redis: ${err?.message}`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
      this.client = null;
    }
  }

  private todayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  buildKey(userId: string, activityKey: string, date?: string): string {
    return `daily_usage:${userId}:${activityKey}:${date ?? this.todayString()}`;
  }

  isAvailable(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }

  /**
   * Atomic increment — trả về count SAU khi tăng.
   * Trả về null nếu Redis không khả dụng (caller fallback sang PG).
   */
  async increment(userId: string, activityKey: string): Promise<number | null> {
    if (!this.isAvailable()) return null;

    const key = this.buildKey(userId, activityKey);
    try {
      const pipeline = this.client!.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, 25 * 3600); // set TTL mỗi lần để luôn refresh
      const results = await pipeline.exec();
      // results[0] = [err, incrValue]
      const newCount = results?.[0]?.[1] as number;
      return newCount ?? null;
    } catch (err) {
      this.logger.warn(`Redis INCR failed: ${err?.message}`);
      return null;
    }
  }

  /** Undo increment khi vượt limit — giảm counter về trạng thái trước. */
  async decrement(userId: string, activityKey: string): Promise<void> {
    if (!this.isAvailable()) return;
    const key = this.buildKey(userId, activityKey);
    try {
      await this.client!.decr(key);
    } catch {
      // ignore — worst case counter off by 1, acceptable
    }
  }

  /**
   * Peek count hiện tại (không tăng).
   */
  async peek(userId: string, activityKey: string): Promise<number> {
    if (!this.isAvailable()) return 0;
    const key = this.buildKey(userId, activityKey);
    try {
      const val = await this.client!.get(key);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Scan tất cả keys `daily_usage:*` để flush về PG.
   * Dùng SCAN thay KEYS để tránh block Redis trên production.
   */
  async scanAllUsageKeys(): Promise<string[]> {
    if (!this.isAvailable()) return [];

    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, batch] = await this.client!.scan(
        cursor,
        'MATCH', 'daily_usage:*',
        'COUNT', 100,
      );
      keys.push(...batch);
      cursor = nextCursor;
    } while (cursor !== '0');

    return keys;
  }

  /**
   * Đọc key từ Redis để đồng bộ về PG.
   * KHÔNG XOÁ (GET thay vì GETDEL) để Redis giữ vai trò Source of Truth trong ngày.
   */
  async get(key: string): Promise<{
    userId: string;
    activityKey: string;
    date: string;
    count: number;
  } | null> {
    if (!this.isAvailable()) return null;
    try {
      const val = await this.client!.get(key);
      if (!val) return null;

      // Parse key: daily_usage:{userId}:{activityKey}:{YYYY-MM-DD}
      // activityKey itself contains colons (e.g. FLASHCARD:LESSON:123), so we must split carefully.
      const withoutPrefix = key.replace('daily_usage:', '');
      const parts = withoutPrefix.split(':');
      const userId = parts[0]; // userId is a UUID, no colons
      const date = parts[parts.length - 1]; // YYYY-MM-DD
      const activityKey = parts.slice(1, parts.length - 1).join(':');

      return { userId, activityKey, date, count: parseInt(val, 10) };
    } catch (err) {
      this.logger.warn(`Redis GETDEL failed for ${key}: ${err?.message}`);
      return null;
    }
  }
}
