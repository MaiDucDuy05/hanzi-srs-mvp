import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TestService, TestQuestionService, TestAttemptService, TestAnswerService } from './test.service';
import {
  CreateTestDto, UpdateTestDto, CreateTestQuestionDto, UpdateTestQuestionDto,
  StartTestAttemptDto, SubmitTestAnswerDto, SubmitTestAttemptDto,
} from './dto/test.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('tests')
export class TestController {
  constructor(private readonly svc: TestService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Tests retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Test retrieved'); }
  @Post() @Roles(Role.TEACHER, Role.ADMIN) @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateTestDto) { return ok(await this.svc.create(dto), 'Test created'); }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: UpdateTestDto) { return ok(await this.svc.update(id, dto), 'Test updated'); }
  @Delete(':id') @Roles(Role.TEACHER, Role.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}

@Controller('test-questions')
export class TestQuestionController {
  constructor(private readonly svc: TestQuestionService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Test questions retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Test question retrieved'); }
  @Post() @Roles(Role.TEACHER, Role.ADMIN) @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateTestQuestionDto) { return ok(await this.svc.create(dto), 'Test question created'); }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: UpdateTestQuestionDto) { return ok(await this.svc.update(id, dto), 'Test question updated'); }
  @Delete(':id') @Roles(Role.TEACHER, Role.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.delete(id); }
}

@Controller('test-attempts')
export class TestAttemptController {
  constructor(
    private readonly svc: TestAttemptService,
    private readonly answerSvc: TestAnswerService,
  ) {}

  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Test attempts retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Test attempt retrieved'); }

  @Post() @HttpCode(HttpStatus.CREATED) async start(@Body() dto: StartTestAttemptDto, @CurrentUser('sub') userId: string) { return ok(await this.svc.start(dto, userId), 'Test attempt started'); }
  @Patch(':id') async submit(@Param('id') id: string, @Body() dto: SubmitTestAttemptDto) { return ok(await this.svc.submit(id, dto), 'Test attempt submitted'); }

  // --- Nested answers under attempts ---
  @Get(':attemptId/answers') async findAnswers(@Param('attemptId') attemptId: string) { return ok(await this.answerSvc.findByAttempt(attemptId), 'Answers retrieved'); }
  @Post(':attemptId/answers') @HttpCode(HttpStatus.CREATED) async submitAnswer(@Param('attemptId') attemptId: string, @Body() dto: SubmitTestAnswerDto) { return ok(await this.answerSvc.submitAnswer(attemptId, dto), 'Answer submitted'); }
}
