import { Controller, Get, Post, Param } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('student')
export class StudentProgressController {
  constructor(private readonly svc: StudentProgressService) {}

  @Get('progress')
  async getProgress(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getProgress(userId), 'Student progress retrieved');
  }

  @Get('recommended-lessons')
  async getRecommendedLessons(@CurrentUser('sub') userId: string) {
    return ok(
      await this.svc.getRecommendedLessons(userId),
      'Recommended lessons retrieved',
    );
  }

  @Get('progress/lesson/:lessonId')
  async getLessonProgress(
    @CurrentUser('sub') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return ok(
      await this.svc.getLessonProgress(userId, lessonId),
      'Lesson progress retrieved',
    );
  }

  @Post('progress/lesson/:lessonId/complete-vocab')
  async completeVocab(
    @CurrentUser('sub') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return ok(
      await this.svc.markVocabCompleted(userId, lessonId),
      'Vocab completed',
    );
  }

  @Post('progress/lesson/:lessonId/complete-grammar')
  async completeGrammar(
    @CurrentUser('sub') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return ok(
      await this.svc.markGrammarCompleted(userId, lessonId),
      'Grammar completed',
    );
  }

  @Get('progress/level/:levelId')
  async getLevelLessonProgress(
    @CurrentUser('sub') userId: string,
    @Param('levelId') levelId: string,
  ) {
    return ok(
      await this.svc.getLevelProgress(userId, levelId),
      'Level progress retrieved',
    );
  }
}
