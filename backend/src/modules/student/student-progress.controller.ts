import { Controller, Get } from '@nestjs/common';
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
}
