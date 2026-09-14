/**
 * SentenceOrderingController — API endpoints cho PR-10.
 *
 * Endpoints:
 *  POST /practice/sentence-ordering/start     — tạo attempt + shuffle
 *  POST /practice/sentence-ordering/:attemptId/submit  — chấm + lưu kết quả
 */
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
import { SentenceOrderingService } from './sentence-ordering.service';
import { GradingService } from './grading.service';
import { PracticeAttemptService } from './practice.service';
import { StartSentenceOrderingDto, SubmitSentenceOrderingDto } from './dto/sentence-ordering.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PracticeType, SourceType } from '../../common/enums/practice.enums';
import { PracticeAttemptStatus } from '../../common/enums/practice.enums';
import { ExpService } from '../achievements/exp.service';
import { ActivityService } from '../achievements/activity.service';
import { StreakService } from '../achievements/streak.service';
import { ActivityType } from '../../common/enums/achievements.enums';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('practice/sentence-ordering')
export class SentenceOrderingController {
  constructor(
    private readonly soService: SentenceOrderingService,
    private readonly gradingService: GradingService,
    private readonly attemptService: PracticeAttemptService,
    private readonly dataSource: DataSource,
    private readonly expService: ExpService,
    private readonly activityService: ActivityService,
    private readonly streakService: StreakService,
  ) {}

  /**
   * POST /practice/sentence-ordering/start
   *
   * 1. Gọi PracticeAttemptService.start() (tiêu thụ lượt PR-14).
   * 2. Fisher-Yates shuffle tokens cho từng câu.
   * 3. Lưu snapshot vào attempt.questionData.
   * 4. Trả shuffled tokens cho frontend (KHÔNG trả answerData).
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body() dto: StartSentenceOrderingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!dto.lessonId && !dto.levelId && !dto.topicId) {
      throw new BadRequestException('Must provide lessonId, levelId, or topicId');
    }

    const userId = user?.sub ?? '';
    const role = user?.role;

    // Resolve source type and id from DTO
    const hasLesson = !!dto.lessonId;
    const hasLevel = !!dto.levelId;
    const hasTopic = !!dto.topicId;
    const sourceType = hasLesson ? SourceType.LESSON : hasLevel ? SourceType.LEVEL : SourceType.TOPIC;
    const sourceId = dto.lessonId ?? dto.levelId ?? dto.topicId!;

    // Tạo attempt generic trước (consume lượt PR-14)
    const attempt = (await this.attemptService.start(
      {
        practiceType: PracticeType.SENTENCE_ORDERING,
        sourceType,
        sourceId,
        idempotencyKey: dto.idempotencyKey,
      },
      userId,
      role,
    )) as import('../practice/entities/practice-attempt.entity').PracticeAttempt;

    // Shuffle tokens + lưu snapshot
    const { questions, snapshot } = await this.soService.startSentenceOrdering(
      attempt.id,
      sourceId,
      sourceType,
      dto.topicId ?? undefined,
      dto.questionCount ?? 5,
    );

    // Cập nhật attempt với snapshot (xáo trộn)
    await this.dataSource.transaction(async (em) => {
      attempt.questionData = snapshot as any;
      await em.getRepository(attempt.constructor as any).save(attempt);
    });

    return ok(
      {
        attemptId: attempt.id,
        questions,
        totalQuestions: questions.length,
      },
      'Sentence ordering started',
    );
  }

  /**
   * POST /practice/sentence-ordering/:attemptId/submit
   *
   * 1. Validate attempt ownership + status IN_PROGRESS.
   * 2. GradingService chấm token IDs.
   * 3. Cập nhật attempt với kết quả.
   */
  @Post(':attemptId/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitSentenceOrderingDto,
    @CurrentUser('sub') userId: string,
  ) {
    // Kiểm tra attempt
    const attempt = await this.attemptService.findById(attemptId, userId, '');
    if (attempt.status !== PracticeAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is not in progress');
    }

    // Chấm điểm
    const gradingResult = await this.gradingService.grade(
      attemptId,
      dto.answers,
      dto.durationSeconds,
    );

    // Cập nhật attempt + award EXP (cùng tx)
    let expAwarded = 0;
    await this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(attempt.constructor as any);
      Object.assign(attempt, {
        answerData: { answers: dto.answers } as any,
        score: gradingResult.score,
        correctCount: gradingResult.totalCorrect,
        wrongCount: gradingResult.totalWrong,
        durationSeconds: dto.durationSeconds,
        status: PracticeAttemptStatus.COMPLETED,
        completedAt: new Date(),
      });
      await repo.save(attempt);

      // PR-33: Award EXP + log activity + update streak.
      expAwarded = await this.expService.awardFromAttempt(
        em, userId,
        { correct: gradingResult.totalCorrect, total: gradingResult.totalQuestions, combo: 0, refId: attemptId },
        `${attemptId}:sentence`,
      );
      if (expAwarded > 0) {
        await this.activityService.log(
          em, userId, ActivityType.PRACTICE_COMPLETED,
          { attemptId, type: 'SENTENCE_ORDERING', correct: gradingResult.totalCorrect, total: gradingResult.totalQuestions },
          expAwarded,
        );
      }
      await this.streakService.recordActivityAndCheckMilestones(em, userId);
    });

    return ok({ ...gradingResult, expAwarded }, 'Sentence ordering submitted');
  }
}
