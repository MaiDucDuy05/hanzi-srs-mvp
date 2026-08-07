import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { DailyPracticeUsage } from './entities/daily-practice-usage.entity';
import { PracticeLimitSettings } from './entities/practice-limit-settings.entity';
import {
  SubscriptionService,
  DailyUsageService,
  LimitSettingsService,
} from './subscription.service';
import {
  SubscriptionController,
  DailyUsageController,
  LimitSettingsController,
} from './subscription.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      DailyPracticeUsage,
      PracticeLimitSettings,
    ]),
  ],
  controllers: [
    SubscriptionController,
    DailyUsageController,
    LimitSettingsController,
  ],
  providers: [SubscriptionService, DailyUsageService, LimitSettingsService],
  exports: [SubscriptionService, DailyUsageService],
})
export class SubscriptionModule {}
