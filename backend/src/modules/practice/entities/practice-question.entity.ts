import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import {
  PracticeAnswerType,
  PracticeQuestionType,
} from '../../../common/enums/practice.enums';

/**
 * Câu hỏi luyện tập dùng chung cho PR-09 (điền chỗ trống) và PR-10 (sắp xếp câu).
 * - accepted_answers: danh sách đáp án hợp lệ (PR-09).
 * - answer_data: mảng token ID theo đúng thứ tự (PR-10).
 * - snapshot đáp án được lưu lại trong attempt khi bắt đầu bài.
 */
@Entity('practice_questions')
export class PracticeQuestion extends BaseEntity {
  @Column({ name: 'question_type', type: 'varchar', length: 30 })
  questionType: PracticeQuestionType;

  @Column({ name: 'level_id', type: 'uuid', nullable: true })
  levelId: string | null;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ name: 'topic_id', type: 'uuid', nullable: true })
  topicId: string | null;

  @Column({ type: 'text', nullable: true })
  prompt: string | null;

  @Column({ name: 'question_data', type: 'jsonb', nullable: true })
  questionData: Record<string, unknown> | null;

  @Column({ name: 'answer_data', type: 'jsonb', nullable: true })
  answerData: Record<string, unknown> | null;

  @Column({ name: 'accepted_answers', type: 'jsonb', nullable: true })
  acceptedAnswers: Record<string, unknown> | null;

  @Column({ name: 'answer_type', type: 'varchar', length: 20, nullable: true })
  answerType: PracticeAnswerType | null;

  @Column({ type: 'text', nullable: true })
  translation: string | null;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'hidden_by_admin', type: 'boolean', default: false })
  hiddenByAdmin: boolean;

  @Column({ name: 'hide_reason', type: 'text', nullable: true })
  hideReason: string | null;

  @Column({ name: 'hidden_at', type: 'timestamptz', nullable: true })
  hiddenAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
