import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { RewardType } from '../../../common/enums/achievements.enums';

/**
 * Catalog phần thưởng (PR-33 ADR-4). Admin-managed qua CRUD.
 * - code: unique slug (vd 'vip_speaking_24h').
 * - cost_exp: EXP cần để redeem.
 * - metadata: config riêng theo type (durationHours, scope, percent, contentId...).
 * - active: toggle ẩn/hiện trên shop.
 */
@Entity('rewards')
@Index('uq_rewards_code', ['code'], { unique: true })
export class Reward extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'varchar', length: 30 })
  type: RewardType;

  @Column({ name: 'cost_exp', type: 'int' })
  costExp: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ type: 'bool', default: true })
  active: boolean;
}
