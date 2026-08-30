import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { Subscription } from './entities/subscription.entity';
import { DailyPracticeUsage } from './entities/daily-practice-usage.entity';
import { PracticeLimitSettings } from './entities/practice-limit-settings.entity';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import {
  SubscriptionService,
  DailyUsageService,
  LimitSettingsService,
} from './subscription.service';
import { VipUpgradeService } from './vip-upgrade-request.service';
import {
  SubscriptionController,
  DailyUsageController,
  LimitSettingsController,
} from './subscription.controller';
import { VipUpgradeController } from './vip-upgrade-request.controller';
import { AdminSubscriptionController } from './admin-subscription.controller';
import { AdminSubscriptionService } from './admin-subscription.service';
import { User } from '../auth/entities/user.entity';
import { RedisUsageService } from './redis-usage.service';
import { DailyUsageFlushProcessor } from './daily-usage-flush.processor';
import { DAILY_USAGE_QUEUE } from '../../common/queue/queue.constants';

import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      DailyPracticeUsage,
      PracticeLimitSettings,
      VipUpgradeRequest,
      User,
    ]),
    ConfigModule,
    BullModule.registerQueue({ name: DAILY_USAGE_QUEUE }),
    AdminModule,
  ],
  controllers: [
    SubscriptionController,
    DailyUsageController,
    LimitSettingsController,
    VipUpgradeController,
    AdminSubscriptionController,
  ],
  providers: [
    SubscriptionService,
    DailyUsageService,
    LimitSettingsService,
    VipUpgradeService,
    AdminSubscriptionService,
    RedisUsageService,
    DailyUsageFlushProcessor,
  ],
  exports: [SubscriptionService, DailyUsageService, VipUpgradeService, RedisUsageService],
})
export class SubscriptionModule {}
