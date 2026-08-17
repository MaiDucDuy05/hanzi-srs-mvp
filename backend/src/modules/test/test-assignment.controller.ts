import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TestAssignmentService } from './test-assignment.service';
import { CreateTestAssignmentDto } from './dto/test-assignment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller('test-assignments')
export class TestAssignmentController {
  constructor(private readonly svc: TestAssignmentService) {}

  @Get('assigned')
  async getAssignedTests(@CurrentUser() user: JwtPayload) {
    // In the future when PR-20 is ready, we would fetch the user's classroom IDs here.
    // For now, we pass an empty array or handle studentId assignments only.
    const classroomIds: string[] = []; 
    return ok(await this.svc.findAssignedToStudent(user.sub, classroomIds), 'Assigned tests retrieved');
  }

  // Fallback endpoint for generic assignment creation
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTestAssignmentDto, @CurrentUser('sub') assignerId: string) {
    return ok(await this.svc.create(dto, assignerId), 'Test assigned');
  }
}
