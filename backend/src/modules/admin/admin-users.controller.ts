import { Controller, Get, Put, Post, Param, Body, Query, UseGuards, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangeRoleDto } from './dto/change-role.dto';


@Controller('admin/users')
@Roles(Role.ADMIN)

export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.adminUsersService.findAll(query);
    return { ...result, message: 'Admin users retrieved successfully' };
  }

  @Get('audit-logs')
  async getAuditLogs(@Query() query: any) {
    const result = await this.auditLogService.getLogs(query);
    return { ...result, message: 'Audit logs retrieved successfully' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.adminUsersService.findById(id);
    return { data: user, message: 'User retrieved successfully' };
  }

  @Put(':id/role')
  async changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const user = await this.adminUsersService.changeRole(id, dto.role, dto.vipDays, adminId, ipAddress);
    return { data: user, message: 'User role updated successfully' };
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const user = await this.adminUsersService.banUser(id, reason, adminId, ipAddress);
    return { data: user, message: 'User banned successfully' };
  }

  @Post(':id/unban')
  @HttpCode(HttpStatus.OK)
  async unbanUser(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const user = await this.adminUsersService.unbanUser(id, adminId, ipAddress);
    return { data: user, message: 'User unbanned successfully' };
  }
}
