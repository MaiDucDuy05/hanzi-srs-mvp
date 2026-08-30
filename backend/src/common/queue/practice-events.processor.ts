import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import type { Job } from 'bull';
import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ExpService } from '../../modules/achievements/exp.service';
import { ActivityService } from '../../modules/achievements/activity.service';
import { StreakService } from '../../modules/achievements/streak.service';
import { ActivityType } from '../enums/achievements.enums';
import { SrsService } from '../../modules/srs/srs.service';
import { SrsRating } from '../../modules/srs/dto/srs.dto';
import { PRACTICE_EVENTS_QUEUE, JOB_ATTEMPT_COMPLETED } from './queue.constants';

export interface AttemptCompletedPayload {
  userId: string;
  attemptId: string;
  practiceType: string;
  correctCount: number;
  wrongCount: number;
  score: number;
  totalQuestions: number;
  vocabResults?: Record<string, boolean>;
}

/**
 * PracticeEventsProcessor — Xử lý side effects của practice submit ASYNCHRONOUSLY.
 * Tách khỏi hot path để giảm latency của PATCH /practice-attempts/:id.
 *
 * Side effects được xử lý:
 *   - Cộng EXP (ExpService.awardFromAttempt)
 *   - Log activity (ActivityService.log)
 *   - Cập nhật streak + check milestones (StreakService.recordActivityAndCheckMilestones)
 *
 * Retry policy: 3 lần, delay 5s, backoff exponential.
 * Idempotent: ExpService dùng idempotency_key nên cộng EXP không bị duplicate khi retry.
 */
@Injectable()
@Processor(PRACTICE_EVENTS_QUEUE)
export class PracticeEventsProcessor {
  private readonly logger = new Logger(PracticeEventsProcessor.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly expService: ExpService,
    private readonly activityService: ActivityService,
    private readonly streakService: StreakService,
    private readonly srsService: SrsService,
  ) {}

  @Process(JOB_ATTEMPT_COMPLETED)
  async handleAttemptCompleted(job: Job): Promise<void> {
    const { userId, attemptId, practiceType, correctCount, totalQuestions, vocabResults } = job.data as AttemptCompletedPayload;

    this.logger.debug(`Processing attempt.completed job ${job.id} for user ${userId}`);

    // Xử lý SRS review trong background
    if (vocabResults) {
      for (const [vocabId, isCorrect] of Object.entries(vocabResults)) {
        try {
          await this.srsService.submitReview(userId, {
            vocabularyId: vocabId,
            rating: isCorrect ? SrsRating.GOOD : SrsRating.AGAIN,
          });
        } catch (e) {
          this.logger.warn(`Failed to update SRS for vocab ${vocabId}:`, e);
        }
      }
    }

    await this.dataSource.transaction(async (em) => {
      const expAwarded = await this.expService.awardFromAttempt(
        em,
        userId,
        {
          correct: correctCount || 0,
          total: totalQuestions || 0,
          combo: 0,
          refId: attemptId,
        },
        `${attemptId}:practice`,
      );

      if (expAwarded > 0) {
        await this.activityService.log(
          em,
          userId,
          ActivityType.PRACTICE_COMPLETED,
          { attemptId, type: practiceType, correct: correctCount, total: totalQuestions },
          expAwarded,
        );
      }
      await this.streakService.recordActivityAndCheckMilestones(em, userId);
    });

    this.logger.debug(`Completed attempt.completed job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: unknown): void {
    const error = err as Error;
    this.logger.error(
      `Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts: ${error.message}`,
      error.stack,
    );
  }
}
