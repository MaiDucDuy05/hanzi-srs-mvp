/**
 * AdminModule — wiring cho admin dashboard endpoints.
 * Import TypeOrm entities cần thiết (User, Subscription, VipUpgradeRequest, AdminAuditLog).
 * ConfigModule cho RevenueService đọc VIP_PRICE_MONTHLY / REVENUE_TARGET_MONTHLY.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { VipUpgradeRequest } from '../subscription/entities/vip-upgrade-request.entity';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { SystemJobLog } from './entities/system-job-log.entity';
import { ContactRequest } from '../resources/entities/contact-request.entity';
import { Resource } from '../resources/entities/resource.entity';
import { AiGenerationJob } from '../resources/entities/ai-generation-job.entity';
import { TestAttempt } from '../test/entities/test-attempt.entity';
import { CacheModule } from '@nestjs/cache-manager';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserStatsService } from './services/user-stats.service';
import { RevenueService } from './services/revenue.service';
import { HealthService } from './services/health.service';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([
      User, 
      Subscription, 
      VipUpgradeRequest, 
      AdminAuditLog,
      SystemJobLog,
      ContactRequest,
      Resource,
      AiGenerationJob,
      TestAttempt
    ]),
  ],
  controllers: [
    AdminController, 
    AdminUsersController
  ],
  providers: [
    AdminService, 
    UserStatsService, 
    RevenueService, 
    HealthService,
    AdminUsersService,
    AuditLogService
  ],
  exports: [AuditLogService],
})
export class AdminModule {}
