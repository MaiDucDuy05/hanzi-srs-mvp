import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Theo dõi EXP cộng trong ngày để áp daily cap (PR-33 ADR-3).
 * - Composite PK (user_id, date) — không extends BaseEntity.
 * - earned: tổng EXP đã cộng trong ngày. Cap = MAX_DAILY_EXP (200).
 * - Streak type bypass cap (ghi trực tiếp, không qua bảng này).
 */
@Entity('exp_daily_earnings')
export class ExpDailyEarnings {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'date' })
  date: string;

  @Column({ type: 'int', default: 0 })
  earned: number;
}
