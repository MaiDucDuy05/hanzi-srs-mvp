import { Controller, Get } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Controller('student')
export class StudentProgressController {
  constructor(private readonly svc: StudentProgressService) {}

  /**
   * GET /student/progress
   * Trả về daily XP, goal, streak cho dashboard.
   */
  @Get('progress')
  async getProgress(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getProgress(userId), 'Student progress retrieved');
  }
}
