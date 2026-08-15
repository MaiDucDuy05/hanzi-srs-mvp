import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';
import { RewardType } from '../../../common/enums/achievements.enums';

// ── Redeem ──
export class RedeemRewardDto {
  /** Chống retry redeem trùng (client gửi id request). */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

// ── Catalog query ──
export class RewardQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// ── Timeline query ──
export class TimelineQueryDto extends PaginationQueryDto {
  /** 'week' | 'month' — khoảng timeline. */
  @IsOptional()
  @IsString()
  range?: 'week' | 'month' = 'month';
}

// ── Admin CRUD ──
export class CreateRewardDto {
  @IsString()
  code: string;

  @IsString()
  title: string;

  @IsEnum(RewardType)
  type: RewardType;

  @IsInt()
  @Min(1)
  costExp: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateRewardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @IsOptional()
  @IsInt()
  @Min(1)
  costExp?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
