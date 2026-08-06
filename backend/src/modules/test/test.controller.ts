import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
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
  @Post() @Roles(Role.TEACHER, Role.ADMIN) async create(@Body() dto: CreateTestDto) { return ok(await this.svc.create(dto), 'Test created'); }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: UpdateTestDto) { return ok(await this.svc.update(id, dto), 'Test updated'); }
  @Post(':id/publish') @Roles(Role.TEACHER, Role.ADMIN) async publish(@Param('id') id: string, @Body('accessCode') accessCode?: string) { return ok(await this.svc.publish(id, accessCode), 'Test published'); }
  @Delete(':id') @Roles(Role.TEACHER, Role.ADMIN) async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Test deleted'); }
}

@Controller('test-questions')
export class TestQuestionController {
  constructor(private readonly svc: TestQuestionService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Test questions retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Test question retrieved'); }
  @Post() @Roles(Role.TEACHER, Role.ADMIN) async create(@Body() dto: CreateTestQuestionDto) { return ok(await this.svc.create(dto), 'Test question created'); }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: UpdateTestQuestionDto) { return ok(await this.svc.update(id, dto), 'Test question updated'); }
  @Delete(':id') @Roles(Role.TEACHER, Role.ADMIN) async remove(@Param('id') id: string) { await this.svc.delete(id); return ok(null, 'Test question deleted'); }
}

@Controller('test-attempts')
export class TestAttemptController {
  constructor(private readonly svc: TestAttemptService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Test attempts retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Test attempt retrieved'); }
  @Post() async start(@Body() dto: StartTestAttemptDto, @CurrentUser('sub') userId: string) { return ok(await this.svc.start(dto, userId), 'Test attempt started'); }
  @Post(':id/submit') async submit(@Param('id') id: string, @Body() dto: SubmitTestAttemptDto) { return ok(await this.svc.submit(id, dto), 'Test attempt submitted'); }
}

@Controller('test-answers')
export class TestAnswerController {
  constructor(private readonly svc: TestAnswerService) {}
  @Post() async submitAnswer(@Body() dto: SubmitTestAnswerDto, @Body('attemptId') attemptId: string) { return ok(await this.svc.submitAnswer(attemptId, dto), 'Answer submitted'); }
  @Get('attempt/:attemptId') async findByAttempt(@Param('attemptId') attemptId: string) { return ok(await this.svc.findByAttempt(attemptId), 'Answers retrieved'); }
}
