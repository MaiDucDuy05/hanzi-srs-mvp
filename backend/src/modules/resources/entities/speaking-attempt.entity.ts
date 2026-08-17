import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { SpeakingStatus } from '../../../common/enums/resources.enums';
import { User } from '../../auth/entities/user.entity';

/** Lượt luyện nói HSKK (FR-08). Ghi âm lưu S3, giáo viên chấm thủ công. */
@Entity('speaking_attempts')
export class SpeakingAttempt extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'audio_key', type: 'varchar', length: 255 })
  audioKey: string;

  @Column({ type: 'varchar', length: 20, default: SpeakingStatus.SUBMITTED })
  status: SpeakingStatus;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'graded_by' })
  grader: User | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
