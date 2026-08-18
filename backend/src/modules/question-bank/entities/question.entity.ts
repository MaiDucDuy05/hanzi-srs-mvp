import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { TestQuestionType } from '../../../common/enums/test.enums';
import { QuestionVisibility, QuestionDifficulty, QuestionSourceType } from './question.enums';
import { User } from '../../auth/entities/user.entity';

// Re-export enums for convenience
export { QuestionVisibility, QuestionDifficulty, QuestionSourceType } from './question.enums';

@Entity('questions')
export class Question extends BaseEntity {
  // ── Ownership ──────────────────────────────────────────────────────────
  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  // ── Question Type & Source ──────────────────────────────────────────────
  /** Question type: SINGLE_CHOICE, FILL_IN, ORDERING, etc. */
  @Column({ type: 'varchar', length: 30 })
  type: TestQuestionType;

  /**
   * Normalized question_type for practice compatibility.
   * Maps to practice question types: FILL_BLANK, SENTENCE_ORDERING, etc.
   */
  @Column({ name: 'question_type', type: 'varchar', length: 30, nullable: true })
  questionType: string | null;

  /** Source type: PRACTICE | EXAM | BOTH */
  @Column({ name: 'source_type', type: 'varchar', length: 20, default: QuestionSourceType.EXAM })
  sourceType: QuestionSourceType;

  // ── Curriculum Binding ─────────────────────────────────────────────────
  @Column({ name: 'hsk_level', type: 'int', nullable: true })
  hskLevel: number | null;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ name: 'topic_id', type: 'uuid', nullable: true })
  topicId: string | null;

  // ── Content ────────────────────────────────────────────────────────────
  /** Generic JSONB content - format varies by type */
  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  // ── Difficulty & Visibility ─────────────────────────────────────────────
  @Column({ type: 'varchar', length: 20, default: QuestionDifficulty.MEDIUM })
  difficulty: QuestionDifficulty;

  @Column({ type: 'varchar', length: 20, default: QuestionVisibility.PRIVATE })
  visibility: QuestionVisibility;

  // ── Organization ───────────────────────────────────────────────────────
  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // ── Admin Moderation ───────────────────────────────────────────────────
  @Column({ name: 'hidden_by_admin', type: 'boolean', default: false })
  hiddenByAdmin: boolean;

  @Column({ name: 'hide_reason', type: 'text', nullable: true })
  hideReason: string | null;

  @Column({ name: 'hidden_at', type: 'timestamptz', nullable: true })
  hiddenAt: Date | null;
}
