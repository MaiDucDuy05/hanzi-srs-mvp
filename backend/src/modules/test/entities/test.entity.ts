import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { TestStatus } from '../../../common/enums/test.enums';

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

  @Column({ name: 'time_limit_minutes', type: 'int', default: 0 })
  timeLimitMinutes: number;

  @Column({ name: 'attempt_limit', type: 'int', default: 1 })
  attemptLimit: number;

  @Column({ type: 'varchar', length: 20, default: TestStatus.DRAFT })
  status: TestStatus;

  @Column({ name: 'access_code', type: 'varchar', length: 20, nullable: true })
  accessCode: string | null;

  @Column({ name: 'show_score_immediately', type: 'boolean', default: true })
  showScoreImmediately: boolean;

  @Column({ name: 'hidden_by_admin', type: 'boolean', default: false })
  hiddenByAdmin: boolean;

  @Column({ name: 'hide_reason', type: 'text', nullable: true })
  hideReason: string | null;

  @Column({ name: 'hidden_at', type: 'timestamptz', nullable: true })
  hiddenAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
