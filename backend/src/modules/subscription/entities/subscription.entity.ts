import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../common/enums/subscription.enums';

/**
 * Gói đăng ký của người dùng (PR-14). Entitlement VIP:
 * status = ACTIVE và expires_at > now().
 * Index (user_id, status) + INCLUDE (plan, expires_at) tạo ở migration.
 */
@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 10, default: SubscriptionPlan.FREE })
  plan: SubscriptionPlan;

  @Column({ type: 'varchar', length: 20, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}
