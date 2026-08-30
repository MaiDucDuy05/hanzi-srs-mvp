import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PRACTICE_EVENTS_QUEUE, DAILY_USAGE_QUEUE } from './queue.constants';

/**
 * QueueModule — Khai báo BullMQ queues kết nối Redis.
 * Khi REDIS_URL không set, dùng localhost:6379 (dev).
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          return { url: redisUrl };
        }
        return {
          redis: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        };
      },
    }),
    BullModule.registerQueue({ name: PRACTICE_EVENTS_QUEUE }),
    BullModule.registerQueue({ name: DAILY_USAGE_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
