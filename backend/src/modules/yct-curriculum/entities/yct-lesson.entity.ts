import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { YctLevel } from './yct-level.entity';

/** Bài học YCT trong từng Level. */
@Entity('yct_lessons')
export class YctLesson extends BaseEntity {
  @Column({ name: 'level_id', type: 'uuid' })
  levelId: string;

  @ManyToOne(() => YctLevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: YctLevel;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'thumbnail_key', type: 'varchar', length: 255, nullable: true })
  thumbnailKey: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // Thuộc tính mở rộng gán động trong Service
  vocabularies?: any[];
  vocabCount?: number;
}
