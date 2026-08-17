import { Controller, Get, Query } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TimelineQueryDto } from './dto/rewards.dto';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

/**
 * AchievementsController — dashboard/timeline/heatmap/radar (PR-33).
 * Read-only, tất cả require JWT (JwtAuthGuard global).
 */
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly svc: AchievementsService) {}

  /** GET /achievements — dashboard (balance, level, streak, recent). */
  @Get()
  async getDashboard(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getDashboard(userId), 'Achievements dashboard');
  }

  /** GET /achievements/timeline — activity timeline (week/month). */
  @Get('timeline')
  async getTimeline(
    @CurrentUser('sub') userId: string,
    @Query() dto: TimelineQueryDto,
  ) {
    return ok(
      await this.svc.getTimeline(userId, dto.range, dto.page, dto.limit),
      'Activity timeline',
    );
  }

  /** GET /achievements/heatmap — activity heatmap (90 ngày). */
  @Get('heatmap')
  async getHeatmap(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getHeatmap(userId), 'Activity heatmap');
  }

  /** GET /achievements/radar — skill radar (practice type distribution). */
  @Get('radar')
  async getRadar(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getRadar(userId), 'Skill radar');
  }
}
