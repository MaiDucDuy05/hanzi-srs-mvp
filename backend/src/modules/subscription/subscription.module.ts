import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    AdminModule,
  ],
  controllers: [
    SubscriptionController,
    DailyUsageController,
    LimitSettingsController,
    VipUpgradeController,
    AdminSubscriptionController,
  ],
  providers: [SubscriptionService, DailyUsageService, LimitSettingsService, VipUpgradeService, AdminSubscriptionService],
  exports: [SubscriptionService, DailyUsageService, VipUpgradeService],
})
export class SubscriptionModule {}
