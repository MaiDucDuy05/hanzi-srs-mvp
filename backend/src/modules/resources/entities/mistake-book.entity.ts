import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../auth/entities/user.entity';

/**
 * Sổ lỗi sai (FR-17). Lưu snapshot câu hỏi + ngữ cảnh để ôn lại.
 * Index (user_id, source_type, source_id, created_at DESC) cho FR-23.
 */
@Entity('mistake_book')
@Index('idx_mistake_book_user_created', ['userId', 'createdAt'])
@Index('idx_mistake_book_user_source', ['userId', 'sourceType', 'sourceId', 'createdAt'])
export class MistakeBook extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'question_id', type: 'uuid', nullable: true })
  questionId: string | null;

  @Column({ name: 'vocabulary_id', type: 'uuid', nullable: true })
  vocabularyId: string | null;

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

  @Column({ name: 'fail_count', type: 'int', default: 1 })
  failCount: number;

  @Column({ name: 'correct_streak', type: 'int', default: 0 })
  correctStreak: number;

  @Column({ name: 'last_failed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastFailedAt: Date;

  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt: Date | null;
}
