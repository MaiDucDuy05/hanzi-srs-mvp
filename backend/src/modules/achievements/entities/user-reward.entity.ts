import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { RewardType } from '../../../common/enums/achievements.enums';

/**
 * Inventory phần thưởng đã redeem (PR-33). Snapshot type+metadata lúc redeem.
 * - idempotency_key: chống redeem trùng (partial unique).
 * - is_used: voucher đã dùng chưa (cosmetic/VIP không cần).
 * - expires_at: hạn dùng (vd VIP 24h, voucher 30 ngày).
 */
@Entity('user_rewards')
@Index('uq_user_rewards_idem', ['userId', 'idempotencyKey'], {
  unique: true,
  where: 'idempotency_key IS NOT NULL',
})
@Index('idx_user_rewards_user_used', ['userId', 'isUsed'])
export class UserReward extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'reward_id', type: 'uuid' })
  rewardId: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 64, nullable: true })
  idempotencyKey: string | null;

  @Column({ type: 'varchar', length: 30 })
  type: RewardType;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ name: 'is_used', type: 'bool', default: false })
  isUsed: boolean;

  @Column({ name: 'redeemed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  redeemedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}
