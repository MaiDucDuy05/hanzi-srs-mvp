import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus, UpgradeRequestStatus, VipPackagePlan } from '../../../common/enums/subscription.enums';
import { PaginationQueryDto } from '../../../common/pagination.dto';

// ── Query DTOs ──

export class SubscriptionQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEnum(SubscriptionPlan) plan?: SubscriptionPlan;
  @IsOptional() @IsEnum(SubscriptionStatus) status?: SubscriptionStatus;
}

export class DailyUsageQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsDateString() usageDate?: string;
}

export class VipUpgradeRequestQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEnum(UpgradeRequestStatus) status?: UpgradeRequestStatus;
}

// ── Create/Update DTOs ──

export class CreateSubscriptionDto {
  @IsUUID() userId: string;
  @IsEnum(SubscriptionPlan) plan: SubscriptionPlan;
  @IsOptional() @IsEnum(SubscriptionStatus) status?: SubscriptionStatus;
  @IsDateString() startsAt: string;
  @IsOptional() @IsDateString() expiresAt?: string | null;
}

export class UpdateSubscriptionDto {
  @IsOptional() @IsEnum(SubscriptionPlan) plan?: SubscriptionPlan;
  @IsOptional() @IsEnum(SubscriptionStatus) status?: SubscriptionStatus;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string | null;
}

export class UpdateLimitSettingsDto {
  @IsOptional() @IsInt() @Min(1) freeLimit?: number;
  @IsOptional() @IsString() resetTimezone?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

export class CheckPracticeLimitDto {
  // userId KHÔNG nhận từ body — server lấy từ JWT (chống giả mạo).
  @IsString() activityKey: string;
}

export class CreateVipUpgradeRequestDto {
  @IsUUID() userId: string;
  @IsEnum(VipPackagePlan) plan: VipPackagePlan;
  @IsInt() @Min(0) amount: number;
  @IsOptional() @IsString() transferNote?: string | null;
  @IsOptional() @IsString() note?: string | null;
}

export class ReviewVipUpgradeDto {
  @IsEnum(UpgradeRequestStatus) status: UpgradeRequestStatus;
  @IsOptional() @IsString() note?: string | null;
}
