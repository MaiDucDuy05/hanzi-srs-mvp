import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Đáp án của một câu trong một lượt làm bài kiểm tra (PR-05). UNIQUE (attempt_id, question_id). */
@Entity('test_answers')
export class TestAnswer extends BaseEntity {
  @Column({ name: 'attempt_id', type: 'uuid' })
  attemptId: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @Column({ type: 'jsonb', nullable: true })
  answer: Record<string, unknown> | null;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ name: 'points_awarded', type: 'int', default: 0 })
  pointsAwarded: number;
}
