import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Question } from '../../question-bank/entities/question.entity';

/** Bảng trung gian liên kết giữa đề thi (Test) và câu hỏi trong Ngân hàng (Question) (PR-05 & PR-06) */
@Entity('test_questions')
export class TestQuestion extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

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
