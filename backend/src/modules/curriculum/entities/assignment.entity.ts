import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

export enum AssignmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

@Entity('assignments')
export class Assignment extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  /** Teacher who assigned this homework */
  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy: string;

  /** Student who receives this homework */
  @Column({ name: 'assigned_to', type: 'uuid' })
  assignedTo: string;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  /** Number of vocabulary words in this assignment */
  @Column({ name: 'vocabulary_count', type: 'int', default: 0 })
  vocabularyCount: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: AssignmentStatus.PENDING,
  })
  status: AssignmentStatus;
}
