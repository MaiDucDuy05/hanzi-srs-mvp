import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { AiJobStatus, AiJobType } from '../../../common/enums/resources.enums';

/**
 * Tác vụ AI bất đồng bộ (FR-15 story, FR-16 study path).
 * API AI >10s → tạo job PENDING, NestJS Schedule xử lý nền,
 * frontend poll khi COMPLETED. Index (status, created_at) cho worker poll.
 */
@Entity('ai_generation_jobs')
export class AiGenerationJob extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'job_type', type: 'varchar', length: 20 })
  jobType: AiJobType;

  @Column({ name: 'input_data', type: 'jsonb' })
  inputData: Record<string, unknown>;

  @Column({ name: 'output_data', type: 'jsonb', nullable: true })
  outputData: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 20, default: AiJobStatus.PENDING })
  status: AiJobStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
