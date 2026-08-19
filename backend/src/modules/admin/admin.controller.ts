/**
 * AdminController — Các endpoint cho admin dashboard (PR-32).
 * Toàn bộ controller yêu cầu role ADMIN.
 * Caching 5 phút cho các endpoint dashboard được cấu hình qua CacheInterceptor.
 */
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { AdminService } from './admin.service';

/** Wrap envelope { data, message } */
function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('admin')
@Roles(Role.ADMIN)
@UseInterceptors(CacheInterceptor)
@CacheTTL(300000) // 5 minutes in milliseconds
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/summary')
  async getDashboardSummary() {
    return ok(await this.adminService.getSummary(), 'Dashboard summary retrieved');
  }

  @Get('dashboard/charts')
  async getDashboardCharts() {
    return ok(await this.adminService.getCharts(), 'Dashboard charts retrieved');
  }

  @Get('dashboard/pending-items')
  async getDashboardPendingItems() {
    return ok(await this.adminService.getPendingItems(), 'Pending items retrieved');
  }

  @Get('dashboard/system-health')
  async getDashboardSystemHealth() {
    return ok(await this.adminService.getSystemHealth(), 'System health retrieved');
  }
}
