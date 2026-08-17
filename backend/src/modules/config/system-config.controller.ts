import { Controller, Get, Put, Body, UseGuards, Req, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { SystemConfig } from './entities/system-config.entity';
import { ConfigCacheService } from './config-cache.service';
import { AuditLogService } from '../admin/audit-log.service';

@Controller('admin/configs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SystemConfigController {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    private readonly configCache: ConfigCacheService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  async getConfigs() {
    const configs = await this.configRepo.find({
      relations: ['updatedByUser'],
    });
    
    // Group configs by 'group' field
    const grouped = configs.reduce((acc, config) => {
      const g = config.group || 'system';
      if (!acc[g]) acc[g] = [];
      acc[g].push(config);
      return acc;
    }, {} as Record<string, SystemConfig[]>);

    return { data: grouped, message: 'Lấy cấu hình thành công' };
  }

  @Put(':key')
  async updateConfig(
    @Param('key') key: string,
    @Body('value') value: string,
    @Req() req: any
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    
    const config = await this.configRepo.findOne({ where: { key } });
    if (!config) {
      return { message: 'Không tìm thấy cấu hình', data: null, statusCode: 404 };
    }

    if (config.value !== value) {
      const oldValue = config.value;
      config.value = value;
      config.updatedBy = adminId;
      await this.configRepo.save(config);

      await this.configCache.invalidate();

      await this.auditLogService.logAction(adminId, 'UPDATE_SYSTEM_CONFIGS', 'SystemConfig', key, ipAddress, {
        reason: 'Cập nhật cấu hình hệ thống',
        newValue: { key, oldValue, newValue: value }
      });
    }

    return { data: config, message: 'Cập nhật cấu hình thành công' };
  }

  @Put('bulk')
  async updateBulkConfigs(
    @Body() updates: { key: string; value: string }[],
    @Req() req: any
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Fetch all existing configs to map their original values for audit logging
    const keys = updates.map(u => u.key);
    const existingConfigs = await this.configRepo.createQueryBuilder('config')
      .where('config.key IN (:...keys)', { keys })
      .getMany();
      
    const existingMap = new Map(existingConfigs.map(c => [c.key, c]));

    const changesForLog = [];

    for (const update of updates) {
      const config = existingMap.get(update.key);
      if (config && config.value !== update.value) {
        changesForLog.push({
          key: config.key,
          oldValue: config.value,
          newValue: update.value
        });

        config.value = update.value;
        config.updatedBy = adminId;
        await this.configRepo.save(config);
      }
    }

    if (changesForLog.length > 0) {
      // Invalidate cache
      await this.configCache.invalidate();

      // Log the bulk update action
      await this.auditLogService.logAction(adminId, 'UPDATE_SYSTEM_CONFIGS', 'SystemConfig', 'bulk', ipAddress, {
        reason: 'Cập nhật cấu hình hệ thống',
        newValue: { changes: changesForLog }
      });
    }

    return { message: 'Cập nhật cấu hình thành công' };
  }
}
