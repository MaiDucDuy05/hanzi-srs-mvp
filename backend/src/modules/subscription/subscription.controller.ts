import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionService, DailyUsageService, LimitSettingsService } from './subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto, UpdateLimitSettingsDto, CheckPracticeLimitDto, SubscriptionQueryDto, DailyUsageQueryDto } from './dto/subscription.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly svc: SubscriptionService) {}
  @Get() @Roles(Role.ADMIN) async findAll(@Query() q: SubscriptionQueryDto) { return ok(await this.svc.findAll(q), 'Subscriptions retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Subscription retrieved'); }
  @Post() @Roles(Role.ADMIN) @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateSubscriptionDto) { return ok(await this.svc.create(dto), 'Subscription created'); }
  @Patch(':id') @Roles(Role.ADMIN) async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) { return ok(await this.svc.update(id, dto), 'Subscription updated'); }
  @Delete(':id') @Roles(Role.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.delete(id); }
}

@Controller('daily-usage')
export class DailyUsageController {
  constructor(private readonly svc: DailyUsageService) {}
  @Get() async findAll(@Query() q: DailyUsageQueryDto) { return ok(await this.svc.findAll(q), 'Daily usage retrieved'); }
  @Post() async checkLimit(@Body() dto: CheckPracticeLimitDto) {
    const result = await this.svc.checkAndIncrement(dto.userId, dto.activityKey);
    return ok(result, result.allowed ? 'Limit check passed' : 'Daily limit reached');
  }
}

@Controller('limit-settings')
export class LimitSettingsController {
  constructor(private readonly svc: LimitSettingsService) {}
  @Get() async get() { return ok(await this.svc.get(), 'Limit settings retrieved'); }
  @Put() @Roles(Role.ADMIN) async upsert(@Body() dto: UpdateLimitSettingsDto) { return ok(await this.svc.upsert(dto), 'Limit settings updated'); }
}
