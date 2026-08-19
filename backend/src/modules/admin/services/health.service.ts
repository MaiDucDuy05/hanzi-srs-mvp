import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between } from 'typeorm';
import { DashboardSystemHealth, HealthStatus, CronJobStatus } from '../dto/admin.dto';
import { SystemJobLog } from '../entities/system-job-log.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { AiGenerationJob } from '../../resources/entities/ai-generation-job.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(SystemJobLog) private jobLogRepo: Repository<SystemJobLog>,
    @InjectRepository(Resource) private resourceRepo: Repository<Resource>,
    @InjectRepository(AiGenerationJob) private aiJobRepo: Repository<AiGenerationJob>,
  ) {}

  async getSystemHealth(): Promise<DashboardSystemHealth> {
    const dbUp = await this.pingDb();
    const uptimeSeconds = Math.floor(process.uptime());
    const lastCheckedAt = new Date().toISOString();

    const statusLabel: HealthStatus = dbUp ? 'Optimal' : 'Critical';
    const healthPercent = dbUp ? 100 : 0;
    const statusMessage = dbUp
      ? `Hệ thống hoạt động bình thường. Uptime ${this.formatUptime(uptimeSeconds)}.`
      : 'Không kết nối được cơ sở dữ liệu.';

    // Lấy dung lượng S3 (MB)
    const { sum } = await this.resourceRepo
      .createQueryBuilder('r')
      .select('SUM(r.file_size)', 'sum')
      .getRawOne();
    
    const storageUsedMb = sum ? Math.round(Number(sum) / (1024 * 1024)) : 0;

    // Đếm số AI calls hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const aiCallsToday = await this.aiJobRepo.count({
      where: {
        createdAt: Between(today, tomorrow),
      }
    });

    // Lấy trạng thái cron jobs
    const cronJobs = await this.getCronJobsStatus();

    return { 
      healthPercent, 
      statusLabel, 
      statusMessage, 
      lastCheckedAt,
      aiCallsToday,
      storageUsedMb,
      cronJobs
    };
  }

  private async getCronJobsStatus(): Promise<CronJobStatus[]> {
    // Lấy log mới nhất của mỗi job_name
    const logs = await this.jobLogRepo
      .createQueryBuilder('log')
      .distinctOn(['log.job_name'])
      .orderBy('log.job_name', 'ASC')
      .addOrderBy('log.last_run', 'DESC')
      .getMany();

    return logs.map(l => ({
      name: l.jobName,
      lastRun: l.lastRun.toISOString(),
      status: l.status,
      errorMessage: l.errorMessage || undefined,
    }));
  }

  private async pingDb(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}
