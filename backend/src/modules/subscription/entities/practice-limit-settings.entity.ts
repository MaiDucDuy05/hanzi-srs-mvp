import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Cấu hình giới hạn lượt chung (PR-14). Single-row config do Admin chỉnh. */
@Entity('practice_limit_settings')
export class PracticeLimitSettings extends BaseEntity {
  @Column({ name: 'free_limit', type: 'int', default: 3 })
  freeLimit: number;

  @Column({
    name: 'reset_timezone',
    type: 'varchar',
    length: 50,
    default: 'Asia/Ho_Chi_Minh',
  })
  resetTimezone: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;
}
