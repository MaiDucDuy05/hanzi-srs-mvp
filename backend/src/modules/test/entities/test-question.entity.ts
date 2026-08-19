import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Test } from './test.entity';
import { Question } from '../../question-bank/entities/question.entity';

/**
 * Bảng trung gian liên kết giữa đề thi (Test) và câu hỏi trong Ngân hàng (Question).
 * PR-05: TestQuestion chỉ lưu FK questionId, không copy nội dung.
 * Điều này đảm bảo: sửa câu hỏi trong ngân hàng → tự động cập nhật trong mọi đề thi.
 */
@Entity('test_questions')
export class TestQuestion extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
