import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { TestAttemptStatus } from '../../../common/enums/test.enums';
import { User } from '../../auth/entities/user.entity';
import { Test } from './test.entity';
import { TestAssignment } from './test-assignment.entity';

/**
 * Lượt làm bài kiểm tra (PR-05).
 * - Chống 2 attempt IN_PROGRESS song song: partial unique index ở migration
 *   WHERE status = 'IN_PROGRESS' (không unique toàn cục vì attempt_limit > 1).
 * - "Chỉ nộp 1 lần" enforce ở service (transition IN_PROGRESS → SUBMITTED).
 */
@Entity('test_attempts')
export class TestAttempt extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  assignmentId: string | null;

  @ManyToOne(() => TestAssignment, { nullable: true })
  @JoinColumn({ name: 'assignment_id' })
  assignment: TestAssignment | null;

  @Column({ type: 'varchar', length: 20, default: TestAttemptStatus.IN_PROGRESS })
  status: TestAttemptStatus;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;
}
