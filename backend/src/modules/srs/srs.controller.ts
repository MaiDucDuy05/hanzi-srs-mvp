/**
 * SrsController — endpoints cho SRS review và progress tracking.
 * Toàn bộ authenticated (userId từ JWT).
 */
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SrsService } from './srs.service';
import { SubmitReviewDto, ProgressQueryDto } from './dto/srs.dto';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('srs')
export class SrsController {
  constructor(private readonly srsService: SrsService) {}

  /**
   * POST /srs/review — submit một SRS rating cho một từ vựng.
   * Body: { vocabularyId, rating: AGAIN|HARD|GOOD|EASY }
   */
  @Post('review')
  async submitReview(
    @Body() dto: SubmitReviewDto,
    @CurrentUser('sub') userId: string,
  ) {
    return ok(
      await this.srsService.submitReview(userId, dto),
      'Review recorded',
    );
  }

  /**
   * GET /srs/progress?lessonId=X — lấy progress map cho user trong một lesson.
   * Trả về object { vocabularyId: { masteryLevel, nextReviewAt, lastReviewedAt, reviewCount } }
   */
  @Get('progress')
  async getProgress(
    @Query() q: ProgressQueryDto,
    @CurrentUser('sub') userId: string,
  ) {
    if (!q.lessonId) {
      return ok({}, 'No lessonId provided');
    }
    const map = await this.srsService.getProgressByLesson(userId, q.lessonId);
    return ok(Object.fromEntries(map), 'Progress retrieved');
  }
}
