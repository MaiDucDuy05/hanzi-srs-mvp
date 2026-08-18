import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  TestService,
  TestQuestionService,
  TestAttemptService,
  TestAnswerService,
} from './test.service';
import { TestAssignmentService } from './test-assignment.service';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateTestQuestionDto,
  UpdateTestQuestionDto,
  StartTestAttemptDto,
  SubmitTestAnswerDto,
  SubmitTestAttemptDto,
  TestQueryDto,
  TestQuestionQueryDto,
  TestAttemptQueryDto,
  GradeAnswerDto,
} from './dto/test.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

/** Giáo viên/Admin thấy đáp án chuẩn; học viên thì không (PR-05 §1.1). */
function canSeeAnswer(role: string | undefined): boolean {
  return role === Role.TEACHER || role === Role.ADMIN;
}

@Controller('tests')
export class TestController {
  constructor(
    private readonly svc: TestService,
    private readonly assignmentSvc: TestAssignmentService,
  ) {}
  @Get() async findAll(@Query() q: TestQueryDto, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.findAll(q, user?.role), 'Tests retrieved');
  }
  @Get(':id') async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.findById(id, user?.role), 'Test retrieved');
  }
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTestDto, @CurrentUser('sub') teacherId: string) {
    return ok(await this.svc.create({ ...dto, teacherId } as any), 'Test created');
  }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.update(id, dto, user.sub, user.role), 'Test updated');
  }

  @Put(':id/questions/order')
  @Roles(Role.TEACHER, Role.ADMIN)
  async updateQuestionOrder(
    @Param('id') id: string,
    @Body() dto: { questionIds: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    // We will call the TestQuestionService to handle this.
    return ok(await this.svc.updateQuestionOrder(id, dto.questionIds, user.sub, user.role), 'Question order updated');
  }

  /** Replace all questions in a test (Cách 1: Create Exam FIRST → Add Questions AFTER). */
  @Put(':id/questions')
  @Roles(Role.TEACHER, Role.ADMIN)
  async replaceQuestions(
    @Param('id') id: string,
    @Body() dto: { questionIds: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.replaceQuestions(id, dto.questionIds, user.sub, user.role), 'Questions replaced');
  }

  /** Add questions to a test without replacing existing ones. */
  @Post(':id/questions')
  @Roles(Role.TEACHER, Role.ADMIN)
  async addQuestions(
    @Param('id') id: string,
    @Body() dto: { questionIds: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.addQuestions(id, dto.questionIds, user.sub, user.role), 'Questions added');
  }
  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.svc.softDelete(id, user.sub, user.role);
  }

  @Post(':id/assign')
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async assignTest(
    @Param('id') testId: string,
    @Body() dto: { classroomId?: string; studentId?: string; startTime: string; endTime: string },
    @CurrentUser('sub') assignerId: string,
  ) {
    return ok(await this.assignmentSvc.create({ testId, ...dto }, assignerId), 'Test assigned');
  }
}

@Controller('test-questions')
export class TestQuestionController {
  constructor(private readonly svc: TestQuestionService) {}
  @Get() async findAll(
    @Query() q: TestQuestionQueryDto,
    @CurrentUser('role') role: string,
  ) {
    return ok(
      await this.svc.findAll(q, canSeeAnswer(role)),
      'Test questions retrieved',
    );
  }
  @Get(':id') async findOne(
    @Param('id') id: string,
    @CurrentUser('role') role: string,
  ) {
    return ok(
      await this.svc.findById(id, canSeeAnswer(role)),
      'Test question retrieved',
    );
  }
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTestQuestionDto) {
    return ok(await this.svc.create(dto), 'Test question created');
  }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestQuestionDto,
  ) {
    return ok(await this.svc.update(id, dto), 'Test question updated');
  }
  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.svc.delete(id);
  }
}

@Controller('test-attempts')
export class TestAttemptController {
  constructor(
    private readonly svc: TestAttemptService,
    private readonly answerSvc: TestAnswerService,
  ) {}

  @Get() async findAll(
    @Query() q: TestAttemptQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(
      await this.svc.findAll(q, user?.sub, user?.role),
      'Test attempts retrieved',
    );
  }
  @Get(':id') async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return ok(
      await this.svc.findById(id, userId, role),
      'Test attempt retrieved',
    );
  }
  @Get(':id/result') async getResult(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return ok(
      await this.svc.getResult(id, userId, role),
      'Test attempt result retrieved',
    );
  }
  @Post() @HttpCode(HttpStatus.CREATED) async start(
    @Body() dto: StartTestAttemptDto,
    @CurrentUser('sub') userId: string,
  ) {
    return ok(await this.svc.start(dto, userId), 'Test attempt started');
  }
  @Patch(':id') async submit(
    @Param('id') id: string,
    @Body() dto: SubmitTestAttemptDto,
    @CurrentUser('sub') userId: string,
  ) {
    return ok(await this.svc.submit(id, dto, userId), 'Test attempt submitted');
  }

  // --- Nested answers under attempts ---
  @Get(':attemptId/answers') async findAnswers(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(
      await this.answerSvc.findByAttempt(attemptId, user?.sub, user?.role),
      'Answers retrieved',
    );
  }
  @Post(':attemptId/answers') @HttpCode(HttpStatus.CREATED) async submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitTestAnswerDto,
    @CurrentUser('sub') userId: string,
  ) {
    return ok(
      await this.answerSvc.submitAnswer(attemptId, dto, userId),
      'Answer submitted',
    );
  }

  @Patch(':attemptId/answers/:questionId/grade') 
  @Roles(Role.TEACHER, Role.ADMIN)
  async gradeAnswer(
    @Param('attemptId') attemptId: string,
    @Param('questionId') questionId: string,
    @Body() dto: GradeAnswerDto,
  ) {
    const answer = await this.answerSvc.gradeAnswerManually(attemptId, questionId, dto.pointsAwarded);
    await this.svc.recalculateScore(attemptId);
    return ok(answer, 'Answer graded successfully');
  }
}
