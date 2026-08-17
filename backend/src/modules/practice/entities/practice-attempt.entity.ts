import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import {
  PracticeAttemptStatus,
  PracticeType,
  SourceType,
} from '../../../common/enums/practice.enums';
import { User } from '../../auth/entities/user.entity';

/**
 * Lượt luyện tập dùng chung cho mọi dạng (PR-03,04,09,10,11,12,13).
 * - Bảng được PARTITION theo tháng trên created_at (xem migration).
 * - idempotency_key: PR-14 chống retry tạo attempt trùng (partial unique).
 * - question_data / answer_data: JSONB snapshot bộ câu hỏi + đáp án.
 */
@Entity('practice_attempts')
@Index('uq_practice_attempts_idem', ['userId', 'idempotencyKey'], {
  unique: true,
  where: 'idempotency_key IS NOT NULL',
})
@Index('idx_practice_attempts_user_status', ['userId', 'status'])
@Index('idx_practice_attempts_user_type_created', ['userId', 'practiceType', 'createdAt'])
export class PracticeAttempt extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'practice_type', type: 'varchar', length: 30 })
  practiceType: PracticeType;

  @Column({ name: 'source_type', type: 'varchar', length: 20 })
  sourceType: SourceType;

  @Column({ name: 'source_id', type: 'varchar', length: 64 })
  sourceId: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 64, nullable: true })
  idempotencyKey: string | null;

  @Column({ name: 'question_data', type: 'jsonb', nullable: true })
  questionData: Record<string, unknown> | null;

  @Column({ name: 'answer_data', type: 'jsonb', nullable: true })
  answerData: Record<string, unknown> | null;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({ name: 'wrong_count', type: 'int', default: 0 })
  wrongCount: number;

  @Column({ name: 'move_count', type: 'int', default: 0 })
  moveCount: number;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: PracticeAttemptStatus.IN_PROGRESS,
  })
  status: PracticeAttemptStatus;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
