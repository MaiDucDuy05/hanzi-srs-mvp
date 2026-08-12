/**
 * HealthService — kiểm tra tình trạng hệ thống qua DB ping + uptime.
 * - DB ping: SELECT 1 qua DataSource. Lỗi → Critical.
 * - Uptime: process.uptime() — thời gian process NestJS chạy liên tục.
 */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SystemHealth, HealthStatus } from '../dto/admin.dto';

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getHealth(): Promise<SystemHealth> {
    const dbUp = await this.pingDb();
    const uptimeSeconds = Math.floor(process.uptime());
    const lastCheckedAt = new Date().toISOString();

    const statusLabel: HealthStatus = dbUp ? 'Optimal' : 'Critical';
    const healthPercent = dbUp ? 100 : 0;
    const statusMessage = dbUp
      ? `Hệ thống hoạt động bình thường. Uptime ${this.formatUptime(uptimeSeconds)}.`
      : 'Không kết nối được cơ sở dữ liệu.';

    return { healthPercent, statusLabel, statusMessage, lastCheckedAt };
  }

  /** Ping DB — trả false nếu SELECT 1 throw. */
  private async pingDb(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  /** Format uptime thành dạng đọc được: "1d 2h 3m" / "2h 3m" / "3m". */
  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}
