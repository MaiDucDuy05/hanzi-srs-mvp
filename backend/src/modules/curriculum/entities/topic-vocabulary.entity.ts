import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Vocabulary } from './vocabulary.entity';
import { Topic } from './topic.entity';

/**
 * Liên kết chủ đề ↔ từ vựng (FR-02). Một từ có thể thuộc nhiều chủ đề.
 * UNIQUE (topic_id, vocabulary_id) tạo ở migration.
 */
@Entity('topic_vocabularies')
@Unique(['topicId', 'vocabularyId'])
export class TopicVocabulary extends BaseEntity {
  @Column({ name: 'topic_id', type: 'uuid' })
  topicId: string;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ name: 'vocabulary_id', type: 'uuid' })
  vocabularyId: string;

  @ManyToOne(() => Vocabulary, (v) => v.topicVocabularies)
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
