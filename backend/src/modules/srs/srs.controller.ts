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
   * GET /srs/progress?lessonId=X&levelId=Y&topicId=Z — lấy progress map cho user trong một lesson / level / topic.
   * Trả về object { vocabularyId: { masteryLevel, nextReviewAt, lastReviewedAt, reviewCount } }
   */
  @Get('progress')
  async getProgress(
    @Query() q: ProgressQueryDto,
    @CurrentUser('sub') userId: string,
  ) {
    if (!q.lessonId && !q.levelId && !q.topicId) {
      return ok({}, 'No lessonId, levelId or topicId provided');
    }
    const map = await this.srsService.getProgress(userId, q.lessonId, q.levelId, q.topicId);
    return ok(Object.fromEntries(map), 'Progress retrieved');
  }

  /**
   * GET /srs/due — lấy danh sách các từ vựng đến hạn ôn tập hôm nay
   */
  @Get('due')
  async getDueItems(@CurrentUser('sub') userId: string) {
    const items = await this.srsService.getDueItems(userId);
    return ok(items, 'Due items retrieved');
  }
}
