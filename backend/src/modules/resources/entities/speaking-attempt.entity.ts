import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { SpeakingStatus } from '../../../common/enums/resources.enums';

/** Lượt luyện nói HSKK (FR-08). Ghi âm lưu S3, giáo viên chấm thủ công. */
@Entity('speaking_attempts')
export class SpeakingAttempt extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'audio_key', type: 'varchar', length: 255 })
  audioKey: string;

  @Column({ type: 'varchar', length: 20, default: SpeakingStatus.SUBMITTED })
  status: SpeakingStatus;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string | null;

  @Column({ type: 'numeric', nullable: true })
  score: string | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
