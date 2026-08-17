import { Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminSubscriptionService } from './admin-subscription.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { VipUpgradeRequestQueryDto, ReviewVipUpgradeDto } from './dto/subscription.dto';
import { IsInt, Min, IsOptional, IsString } from 'class-validator';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

export class ExtendSubscriptionDto {
  @IsInt() @Min(1) days: number;
  @IsOptional() @IsString() note?: string;
}

export class CancelSubscriptionDto {
  @IsOptional() @IsString() note?: string;
}

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSubscriptionController {
  constructor(private readonly svc: AdminSubscriptionService) {}

  @Get('stats')
  async getStats() {
    return ok(await this.svc.getStats(), 'Stats retrieved');
  }

  @Get('requests')
  async getRequests(@Query() q: VipUpgradeRequestQueryDto) {
    return ok(await this.svc.getRequests(q), 'Requests retrieved');
  }

  @Post('requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveRequest(@Param('id') id: string, @CurrentUser('sub') adminId: string) {
    return ok(await this.svc.approveRequest(id, adminId), 'Approved');
  }

  @Post('requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(@Param('id') id: string, @Body() dto: ReviewVipUpgradeDto, @CurrentUser('sub') adminId: string) {
    return ok(await this.svc.rejectRequest(id, adminId, dto.note), 'Rejected');
  }

  @Post(':userId/extend')
  @HttpCode(HttpStatus.OK)
  async extendSubscription(@Param('userId') userId: string, @Body() dto: ExtendSubscriptionDto, @CurrentUser('sub') adminId: string) {
    return ok(await this.svc.extendSubscription(userId, adminId, dto.days, dto.note), 'Extended');
  }

  @Post(':userId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@Param('userId') userId: string, @Body() dto: CancelSubscriptionDto, @CurrentUser('sub') adminId: string) {
    return ok(await this.svc.cancelSubscription(userId, adminId, dto.note), 'Cancelled');
  }
}
