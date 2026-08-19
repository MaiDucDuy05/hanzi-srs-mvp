import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpTransaction } from './entities/exp-transaction.entity';
import { UserActivity } from './entities/user-activity.entity';
import { ExpDailyEarnings } from './entities/exp-daily-earnings.entity';
import { Reward } from './entities/reward.entity';
import { UserReward } from './entities/user-reward.entity';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { ExpService } from './exp.service';
import { ActivityService } from './activity.service';
import { StreakService } from './streak.service';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { RewardsService } from './rewards/rewards.service';
import { RewardsAdminService } from './rewards/rewards-admin.service';
import { RewardsController } from './rewards/rewards.controller';
import { RewardsAdminController } from './rewards/rewards-admin.controller';
import { ActivityPurgeService } from './activity-purge.service';

/**
 * Achievements & Rewards module (PR-33).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpTransaction,
      UserActivity,
      ExpDailyEarnings,
      Reward,
      UserReward,
      User,
      PracticeAttempt,
      Subscription,
    ]),
  ],
  providers: [
    ExpService, ActivityService, StreakService,
    AchievementsService,
    RewardsService, RewardsAdminService,
    ActivityPurgeService,
  ],
  controllers: [AchievementsController, RewardsController, RewardsAdminController],
  exports: [ExpService, ActivityService, StreakService],
})
export class AchievementsModule {}
