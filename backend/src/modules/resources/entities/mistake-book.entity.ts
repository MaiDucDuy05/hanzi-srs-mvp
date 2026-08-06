import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Sổ lỗi sai (FR-17). Lưu snapshot câu hỏi + ngữ cảnh để ôn lại.
 * Index (user_id, source_type, source_id, created_at DESC) cho FR-23.
 */
@Entity('mistake_book')
export class MistakeBook extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'source_type', type: 'varchar', length: 20 })
  sourceType: string;

  @Column({ name: 'source_id', type: 'varchar', length: 64 })
  sourceId: string;

  @Column({ name: 'question_type', type: 'varchar', length: 30 })
  questionType: string;

  @Column({ name: 'question_snapshot', type: 'jsonb' })
  questionSnapshot: Record<string, unknown>;

  @Column({ name: 'user_answer', type: 'jsonb', nullable: true })
  userAnswer: Record<string, unknown> | null;

  @Column({ name: 'correct_answer', type: 'jsonb', nullable: true })
  correctAnswer: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;
}
