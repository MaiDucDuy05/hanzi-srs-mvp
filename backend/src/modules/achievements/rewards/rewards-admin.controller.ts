import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { RewardsAdminService } from './rewards-admin.service';
import { CreateRewardDto, UpdateRewardDto } from '../dto/rewards.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

/**
 * RewardsAdminController — admin CRUD catalog (PR-33 ADR-4).
 * Admin-only (@Roles ADMIN).
 */
@Controller('admin/rewards')
@Roles(Role.ADMIN)
export class RewardsAdminController {
  constructor(private readonly svc: RewardsAdminService) {}

  @Get()
  async findAll() {
    return ok(await this.svc.findAll(), 'All rewards');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRewardDto) {
    return ok(await this.svc.create(dto), 'Reward created');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRewardDto) {
    return ok(await this.svc.update(id, dto), 'Reward updated');
  }

  @Patch(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    return ok(await this.svc.toggleActive(id), 'Reward toggled');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return ok(await this.svc.remove(id), 'Reward removed');
  }
}
