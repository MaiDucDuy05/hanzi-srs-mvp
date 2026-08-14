import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { TopicVocabulary } from './topic-vocabulary.entity';

/** Từ vựng (FR-01). Dùng cho: bài học, chủ đề, practice, flashcard, game. */
@Entity('vocabularies')
export class Vocabulary extends BaseEntity {
  @Column({ name: 'level_id', type: 'uuid' })
  levelId: string;

  @Column({ type: 'varchar', length: 50 })
  hanzi: string;

  @Column({ type: 'varchar', length: 100 })
  pinyin: string;

  @Column({ name: 'meaning_vi', type: 'text' })
  meaningVi: string;

  @Column({ name: 'audio_key', type: 'varchar', length: 255, nullable: true })
  audioKey: string | null;

  @Column({ name: 'part_of_speech', type: 'varchar', length: 30, nullable: true })
  partOfSpeech: string | null;

  @Column({ type: 'text', nullable: true })
  example: string | null;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  /** Quan hệ ngược: các topic chứa từ này (qua join table). */
  @OneToMany(() => TopicVocabulary, (tv) => tv.vocabulary)
  topicVocabularies: TopicVocabulary[];
}
