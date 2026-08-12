/**
 * AdminController — endpoint dashboard overview cho admin.
 * Toàn bộ controller yêu cầu role ADMIN (class-level @Roles).
 */
import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { AdminService } from './admin.service';

/** Wrap envelope { data, message } — nhất quán với các controller khác. */
function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** GET /admin/dashboard/overview — tổng hợp stats cho admin dashboard (1 round-trip). */
  @Get('dashboard/overview')
  async getDashboardOverview() {
    return ok(
      await this.adminService.getOverview(),
      'Dashboard overview retrieved',
    );
  }
}
