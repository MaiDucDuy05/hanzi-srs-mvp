import { Controller, Get } from '@nestjs/common';
import { LessonSelectionService } from './lesson-selection.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('lesson-selection')
export class LessonSelectionController {
  constructor(private readonly svc: LessonSelectionService) {}

  /**
   * GET /lesson-selection/overview
   * Tổng hợp HSK levels, Topics, Assignments, và thống kê mistake book.
   * userId được lấy từ JWT token qua @CurrentUser.
   */
  @Get('overview')
  async getOverview(@CurrentUser('sub') userId: string) {
    return ok(
      await this.svc.getOverview(userId),
      'Lesson selection overview retrieved',
    );
  }
}
