import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { YctLevel } from './yct-level.entity';
import { YctLesson } from './yct-lesson.entity';

/** Từ vựng YCT có kèm ảnh minh hoạ S3 (image_key). */
@Entity('yct_vocabularies')
export class YctVocabulary extends BaseEntity {
  @Column({ name: 'level_id', type: 'uuid', nullable: true })
  levelId: string | null;

  @ManyToOne(() => YctLevel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_id' })
  level?: YctLevel | null;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @ManyToOne(() => YctLesson, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lesson_id' })
  lesson?: YctLesson | null;

  @Column({ type: 'varchar', length: 50 })
  hanzi: string;

  @Column({ type: 'varchar', length: 100 })
  pinyin: string;

  @Column({ name: 'meaning_vi', type: 'text' })
  meaningVi: string;

  @Column({ name: 'audio_key', type: 'varchar', length: 255, nullable: true })
  audioKey: string | null;

  /** S3 key của ảnh minh hoạ cho trẻ em */
  @Column({ name: 'image_key', type: 'varchar', length: 255, nullable: true })
  imageKey: string | null;

  @Column({ name: 'part_of_speech', type: 'varchar', length: 100, nullable: true })
  partOfSpeech: string | null;

  @Column({ type: 'text', nullable: true })
  example: string | null;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
