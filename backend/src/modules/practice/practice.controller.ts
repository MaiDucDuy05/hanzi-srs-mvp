import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { PracticeQuestionService, PracticeAttemptService } from './practice.service';
import { CreatePracticeQuestionDto, UpdatePracticeQuestionDto, StartPracticeAttemptDto, SubmitPracticeAttemptDto } from './dto/practice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('practice-questions')
export class PracticeQuestionController {
  constructor(private readonly svc: PracticeQuestionService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Practice questions retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Practice question retrieved'); }
  @Post() async create(@Body() dto: CreatePracticeQuestionDto) { return ok(await this.svc.create(dto), 'Practice question created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdatePracticeQuestionDto) { return ok(await this.svc.update(id, dto), 'Practice question updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Practice question deleted'); }
}

@Controller('practice-attempts')
export class PracticeAttemptController {
  constructor(private readonly svc: PracticeAttemptService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Practice attempts retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Practice attempt retrieved'); }
  @Post() async start(@Body() dto: StartPracticeAttemptDto, @CurrentUser('sub') userId: string) { return ok(await this.svc.start(dto, userId), 'Practice attempt started'); }
  @Post(':id/submit') async submit(@Param('id') id: string, @Body() dto: SubmitPracticeAttemptDto) { return ok(await this.svc.submit(id, dto), 'Practice attempt submitted'); }
}
