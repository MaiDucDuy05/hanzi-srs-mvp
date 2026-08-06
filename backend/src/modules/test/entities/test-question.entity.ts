import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { TestQuestionType } from '../../../common/enums/test.enums';

/** Câu hỏi trong bài kiểm tra (PR-05). options/correct_answer lưu JSONB. */
@Entity('test_questions')
export class TestQuestion extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

  @Column({ name: 'question_type', type: 'varchar', length: 20 })
  questionType: TestQuestionType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, unknown> | null;

  @Column({ name: 'correct_answer', type: 'jsonb', nullable: true })
  correctAnswer: Record<string, unknown> | null;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
