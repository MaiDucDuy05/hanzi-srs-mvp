import { CacheModule } from '@nestjs/cache-manager';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

/**
 * AppCacheModule — Global Redis cache dùng chung toàn app.
 * TTL mặc định 60s, override per-call qua CacheManager.set(key, val, ttl).
 *
 * Khi REDIS_URL không set (dev local), fallback sang in-memory cache tự động.
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          return {
            stores: [createKeyv(redisUrl)],
          };
        }
        // Fallback in-memory khi không có Redis (unit test / dev local)
        return { ttl: 60_000 };
      },
    }),
  ],
})
export class AppCacheModule {}
