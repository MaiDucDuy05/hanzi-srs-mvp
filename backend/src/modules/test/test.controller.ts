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
} from '@nestjs/common';
import {
  TestService,
  TestQuestionService,
  TestAttemptService,
  TestAnswerService,
} from './test.service';
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
  constructor(private readonly svc: TestService) {}
  @Get() async findAll(@Query() q: TestQueryDto) {
    return ok(await this.svc.findAll(q), 'Tests retrieved');
  }
  @Get(':id') async findOne(@Param('id') id: string) {
    return ok(await this.svc.findById(id), 'Test retrieved');
  }
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTestDto) {
    return ok(await this.svc.create(dto), 'Test created');
  }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return ok(await this.svc.update(id, dto), 'Test updated');
  }
  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.svc.softDelete(id);
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

  @Get() async findAll(@Query() q: TestAttemptQueryDto) {
    return ok(await this.svc.findAll(q), 'Test attempts retrieved');
  }
  @Get(':id') async findOne(@Param('id') id: string) {
    return ok(await this.svc.findById(id), 'Test attempt retrieved');
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
}
