import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { HskLevel } from './hsk-level.entity';

/** Ngữ pháp (FR-01). */
@Entity('grammar_points')
export class GrammarPoint extends BaseEntity {
  @Column({ name: 'level_id', type: 'uuid' })
  levelId: string;

  @ManyToOne(() => HskLevel)
  @JoinColumn({ name: 'level_id' })
  level: HskLevel;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  structure: string | null;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
