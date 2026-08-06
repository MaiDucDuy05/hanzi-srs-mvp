import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Cấp HSK1–9. Seed sẵn HSK1..HSK9 (xem seeds/seed-hsk-levels.ts). */
@Entity('hsk_levels')
export class HskLevel extends BaseEntity {
  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
