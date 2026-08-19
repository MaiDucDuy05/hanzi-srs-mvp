import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FillBlankService } from './fill-blank.service';
import { GradingService } from './grading.service';
import { PracticeAttemptService } from './practice.service';
import { StartFillBlankDto, SubmitFillBlankDto } from './dto/fill-blank.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PracticeType, SourceType } from '../../common/enums/practice.enums';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { ExpService } from '../achievements/exp.service';
import { ActivityService } from '../achievements/activity.service';
import { StreakService } from '../achievements/streak.service';
import { ActivityType, ExpRefType } from '../../common/enums/achievements.enums';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('practice/fill-blank')
export class FillBlankController {
  constructor(
    private readonly fbService: FillBlankService,
    private readonly gradingService: GradingService,
    private readonly attemptService: PracticeAttemptService,
    private readonly dataSource: DataSource,
    private readonly expService: ExpService,
    private readonly activityService: ActivityService,
    private readonly streakService: StreakService,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body() dto: StartFillBlankDto,
    @CurrentUser() user: JwtPayload,
  ) {
    let sourceType: SourceType;
    let sourceId: string;

    if (dto.lessonId) { sourceType = SourceType.LESSON; sourceId = dto.lessonId; }
    else if (dto.levelId) { sourceType = SourceType.LEVEL; sourceId = dto.levelId; }
    else if (dto.topicId) { sourceType = SourceType.TOPIC; sourceId = dto.topicId; }
    else throw new BadRequestException('Must provide lessonId, levelId, or topicId');

    const attempt = await this.attemptService.start(
      {
        practiceType: PracticeType.FILL_BLANK,
        sourceType,
        sourceId,
        idempotencyKey: dto.idempotencyKey || undefined,
      },
      user?.sub,
      user?.role,
    ) as PracticeAttempt;

    const { questions } = await this.fbService.startFillBlank(
      attempt.id,
      sourceId,
      sourceType,
      dto.topicId || undefined,
      dto.questionCount || 5,
    );

    return ok({ attemptId: attempt.id, questions }, 'Started fill-blank practice');
  }

  @Post(':attemptId/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitFillBlankDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dataSource.transaction(async (em) => {
      const result = await this.gradingService.gradeFillBlank(
        em,
        attemptId,
        dto.answers,
        userId,
      );

      await this.attemptService.submit(
        attemptId,
        {
          durationSeconds: dto.durationSeconds,
          score: result.score,
          correctCount: result.totalCorrect,
          wrongCount: result.totalWrong,
          moveCount: 0,
        },
        userId,
      );

      // PR-33: Award EXP + log activity + update streak (cùng tx).
      const expAwarded = await this.expService.awardFromAttempt(
        em, userId,
        { correct: result.totalCorrect, total: result.totalQuestions, combo: 0, refId: attemptId },
        `${attemptId}:fill`,
      );
      if (expAwarded > 0) {
        await this.activityService.log(
          em, userId, ActivityType.PRACTICE_COMPLETED,
          { attemptId, type: 'FILL_BLANK', correct: result.totalCorrect, total: result.totalQuestions },
          expAwarded,
        );
      }
      await this.streakService.recordActivityAndCheckMilestones(em, userId);

      return ok({ ...result, expAwarded }, 'Fill-blank answers graded and submitted');
    });
  }
}
