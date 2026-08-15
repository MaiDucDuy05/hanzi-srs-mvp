import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Log lưu trạng thái chạy của các tác vụ ngầm (Cron jobs).
 */
@Entity('system_job_logs')
export class SystemJobLog extends BaseEntity {
  @Column({ name: 'job_name', type: 'varchar', length: 100 })
  jobName: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'OK' | 'ERROR';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'last_run', type: 'timestamptz' })
  lastRun: Date;
}
