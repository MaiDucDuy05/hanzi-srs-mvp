import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus } from '../../../common/enums/subscription.enums';
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
