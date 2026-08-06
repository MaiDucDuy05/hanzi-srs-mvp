import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  SubscriptionService,
  DailyUsageService,
  LimitSettingsService,
} from './subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  UpdateLimitSettingsDto,
  CheckPracticeLimitDto,
  SubscriptionQueryDto,
  DailyUsageQueryDto,
} from './dto/subscription.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly svc: SubscriptionService) {}

  @Get() @Roles(Role.ADMIN) async findAll(@Query() q: SubscriptionQueryDto) {
    return ok(await this.svc.findAll(q), 'Subscriptions retrieved');
  }

  /** Tự xem gói của mình — phải khai báo trước @Get(':id') để 'me' không bị chặn làm id. */
  @Get('me') async findMe(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.findByUser(userId), 'Subscription retrieved');
  }

  @Get(':id') async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(
      await this.svc.findByIdScoped(id, user?.sub, user?.role),
      'Subscription retrieved',
    );
  }

  @Post() @Roles(Role.ADMIN) @HttpCode(HttpStatus.CREATED) async create(
    @Body() dto: CreateSubscriptionDto,
  ) {
    return ok(await this.svc.create(dto), 'Subscription created');
  }
  @Patch(':id') @Roles(Role.ADMIN) async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return ok(await this.svc.update(id, dto), 'Subscription updated');
  }
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.svc.delete(id);
  }
}

@Controller('daily-usage')
export class DailyUsageController {
  constructor(private readonly svc: DailyUsageService) {}

  /**
   * Kiểm tra lượt TRƯỚC khi bắt đầu bài (pure peek, không tăng lượt — PR-14 §1.3
   * chỉ tính lượt khi attempt tạo thành công). Người dùng lấy từ JWT, không tin body.
   */
  @Post() async checkLimit(
    @Body() dto: CheckPracticeLimitDto,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.svc.peek(userId, dto.activityKey);
    return ok(
      result,
      result.allowed ? 'Limit check passed' : 'Daily limit reached',
    );
  }
}

@Controller('limit-settings')
export class LimitSettingsController {
  constructor(private readonly svc: LimitSettingsService) {}
  @Get() async get() {
    return ok(await this.svc.get(), 'Limit settings retrieved');
  }
  @Put() @Roles(Role.ADMIN) async upsert(@Body() dto: UpdateLimitSettingsDto) {
    return ok(await this.svc.upsert(dto), 'Limit settings updated');
  }
}
