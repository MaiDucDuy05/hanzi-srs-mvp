import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { UpgradeRequestStatus } from '../../../common/enums/resources.enums';

/** Yêu cầu nâng cấp VIP (FR-26). Admin xác nhận và kích hoạt gói thủ công. */
@Entity('vip_upgrade_requests')
export class VipUpgradeRequest extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: UpgradeRequestStatus.PENDING })
  status: UpgradeRequestStatus;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;
}
