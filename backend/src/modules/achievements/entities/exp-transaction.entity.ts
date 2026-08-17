import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ExpRefType, ExpTransactionType } from '../../../common/enums/achievements.enums';

/**
 * Ledger EXP append-only (PR-33). Mỗi dòng cộng/trừ EXP.
 * - PARTITION BY RANGE(created_at) theo tháng (xem migration 005).
 * - amount: dương = cộng, âm = trừ. CHECK amount <> 0.
 * - idempotency_key: chống retry (partial unique trên từng partition).
 * - KHÔNG bao giờ xóa (sổ cái tài chính đối soát vĩnh viễn).
 */
@Entity('exp_transactions')
@Index('idx_exp_tx_user_created', ['userId', 'createdAt'])
export class ExpTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 30 })
  type: ExpTransactionType;

  @Column({ name: 'ref_type', type: 'varchar', length: 30, nullable: true })
  refType: ExpRefType | null;

  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 64, nullable: true })
  idempotencyKey: string | null;
}
