import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Test } from './test.entity';
import { User } from '../../auth/entities/user.entity';

/**
 * Lệnh giao bài kiểm tra (PR-05).
 * - classroomId lưu dạng string do PR-20 chưa triển khai.
 */
@Entity('test_assignments')
export class TestAssignment extends BaseEntity {
  @Column({ name: 'test_id', type: 'uuid' })
  testId: string;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
  classroomId: string | null;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assigner: User;

  @Column({ name: 'status_on_submit', type: 'varchar', length: 20, default: 'GRADED' })
  statusOnSubmit: string;
}
