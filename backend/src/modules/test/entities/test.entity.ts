import { Column, Entity, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { TestStatus, TestCategory } from '../../../common/enums/test.enums';

/**
 * Bài kiểm tra do giáo viên tạo (PR-05).
 * attempt_limit do giáo viên cấu hình (mặc định 1).
 * access_code sinh khi publish; unique partial (nullable).
 */
@Entity('tests')
export class Test extends BaseEntity {
  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'hsk_level', type: 'int', nullable: true })
  hskLevel: number | null;

  @Column({ name: 'time_limit_minutes', type: 'int', default: 0 })
  timeLimitMinutes: number;

  @Column({ name: 'shuffle_questions', type: 'boolean', default: false })
  shuffleQuestions: boolean;

  @Column({ name: 'show_answers_after', type: 'boolean', default: false })
  showAnswersAfter: boolean;

  @Column({ name: 'attempt_limit', type: 'int', default: 1 })
  attemptLimit: number;

  @Column({ type: 'varchar', length: 20, default: TestStatus.DRAFT })
  status: TestStatus;

  @Column({ name: 'access_code', type: 'varchar', length: 20, nullable: true })
  accessCode: string | null;

  @Column({ name: 'show_score_immediately', type: 'boolean', default: true })
  showScoreImmediately: boolean;

  /**
   * Phan loai bai thi. VD: QUIZ_15M, FINAL_EXAM, CUSTOM...
   * null = de thi cu (truoc khi co tinh nang Template).
   */
  @Column({ type: 'varchar', length: 30, nullable: true })
  category: TestCategory | null;

  /**
   * FK -> test_templates.id.
   * null = bai Custom hoac de thi khong duoc sinh tu Template.
   */
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @Column({ name: 'hidden_by_admin', type: 'boolean', default: false })
  hiddenByAdmin: boolean;

  @Column({ name: 'hide_reason', type: 'text', nullable: true })
  hideReason: string | null;

  @Column({ name: 'hidden_at', type: 'timestamptz', nullable: true })
  hiddenAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
