/**
 * AdminModule — wiring cho admin dashboard endpoints.
 * Import TypeOrm entities cần thiết (User, Subscription, VipUpgradeRequest).
 * ConfigModule cho RevenueService đọc VIP_PRICE_MONTHLY / REVENUE_TARGET_MONTHLY.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { VipUpgradeRequest } from '../resources/entities/vip-upgrade-request.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserStatsService } from './services/user-stats.service';
import { RevenueService } from './services/revenue.service';
import { HealthService } from './services/health.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Subscription, VipUpgradeRequest]),
  ],
  controllers: [AdminController],
  providers: [AdminService, UserStatsService, RevenueService, HealthService],
})
export class AdminModule {}
