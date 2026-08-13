/**
 * HanziWritingController — PR-13.
 *
 * Endpoints:
 *  POST /practice/hanzi-writing/start     — tạo attempt + trả danh sách chữ
 *  POST /practice/hanzi-writing/:attemptId/complete — lưu kết quả cuối phiên
 *
 * GET /practice/attempts/:id reuses PracticeAttemptController.
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
import { PracticeAttemptService } from './practice.service';
import { HanziWritingService, type HanziChar } from './hanzi-writing.service';
import { StartHanziWritingDto, CompleteHanziWritingDto } from './hanzi-writing.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PracticeType, SourceType } from '../../common/enums/practice.enums';

@Controller('practice/hanzi-writing')
export class HanziWritingController {
  constructor(
    private readonly hwService: HanziWritingService,
    private readonly attemptService: PracticeAttemptService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * POST /practice/hanzi-writing/start
   *
   * 1. Resolve source → characters from vocabulary.
   * 2. Call PracticeAttemptService.start() (consume PR-14).
   * 3. Save characters into attempt.questionData.
   * 4. Return attemptId + characters.
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body() dto: StartHanziWritingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!dto.levelId && !dto.lessonId && !dto.topicId) {
      throw new BadRequestException('Must provide levelId, lessonId, or topicId');
    }

    const userId = user?.sub ?? '';
    const role = user?.role;

    // Resolve characters from vocabulary source
    const chars = await this.hwService.resolveChars(dto);
    if (chars.length === 0) {
      throw new BadRequestException('No characters found for this source');
    }

    // Determine source type and id
    const hasLevel = !!dto.levelId;
    const hasLesson = !!dto.lessonId;
    const hasTopic = !!dto.topicId;
    const sourceType = hasLesson
      ? SourceType.LESSON
      : hasLevel
        ? SourceType.LEVEL
        : SourceType.TOPIC;
    const sourceId = dto.lessonId ?? dto.levelId ?? dto.topicId!;

    // Create attempt (consume PR-14 daily limit)
    const attempt = (await this.attemptService.start(
      {
        practiceType: PracticeType.HANZI_WRITING,
        sourceType,
        sourceId,
      },
      userId,
      role,
    )) as import('./entities/practice-attempt.entity').PracticeAttempt;

    // Save characters into attempt.questionData
    await this.hwService.saveSessionChars(attempt.id, chars);

    return {
      data: {
        attemptId: attempt.id,
        characters: chars as HanziChar[],
        totalCharacters: chars.length,
      },
      message: 'Hanzi writing session started',
    };
  }

  /**
   * POST /practice/hanzi-writing/:attemptId/complete
   *
   * Validate attempt ownership + status, save results.
   */
  @Post(':attemptId/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('attemptId') attemptId: string,
    @Body() dto: CompleteHanziWritingDto,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.hwService.complete(attemptId, userId, dto);
    return {
      data: result,
      message: 'Hanzi writing session completed',
    };
  }
}
