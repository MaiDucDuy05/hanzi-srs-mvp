import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Liên kết chủ đề ↔ từ vựng (FR-02). Một từ có thể thuộc nhiều chủ đề.
 * UNIQUE (topic_id, vocabulary_id) tạo ở migration.
 */
@Entity('topic_vocabularies')
export class TopicVocabulary extends BaseEntity {
  @Column({ name: 'topic_id', type: 'uuid' })
  topicId: string;

  @Column({ name: 'vocabulary_id', type: 'uuid' })
  vocabularyId: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
