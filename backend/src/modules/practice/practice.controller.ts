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
  PracticeQuestionService,
  PracticeAttemptService,
} from './practice.service';
import {
  CreatePracticeQuestionDto,
  UpdatePracticeQuestionDto,
  StartPracticeAttemptDto,
  SubmitPracticeAttemptDto,
  PracticeQuestionQueryDto,
  PracticeAttemptQueryDto,
} from './dto/practice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller('practice-questions')
export class PracticeQuestionController {
  constructor(private readonly svc: PracticeQuestionService) {}
  @Get() async findAll(@Query() q: PracticeQuestionQueryDto) {
    return ok(await this.svc.findAll(q), 'Practice questions retrieved');
  }
  @Get(':id') async findOne(@Param('id') id: string) {
    return ok(await this.svc.findById(id), 'Practice question retrieved');
  }
  @Post() @HttpCode(HttpStatus.CREATED) async create(
    @Body() dto: CreatePracticeQuestionDto,
  ) {
    return ok(await this.svc.create(dto), 'Practice question created');
  }
  @Patch(':id') async update(
    @Param('id') id: string,
    @Body() dto: UpdatePracticeQuestionDto,
  ) {
    return ok(await this.svc.update(id, dto), 'Practice question updated');
  }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(
    @Param('id') id: string,
  ) {
    await this.svc.softDelete(id);
  }
}

@Controller('practice-attempts')
export class PracticeAttemptController {
  constructor(private readonly svc: PracticeAttemptService) {}
  @Get() async findAll(@Query() q: PracticeAttemptQueryDto) {
    return ok(await this.svc.findAll(q), 'Practice attempts retrieved');
  }
  @Get(':id') async findOne(@Param('id') id: string) {
    return ok(await this.svc.findById(id), 'Practice attempt retrieved');
  }
  @Post() @HttpCode(HttpStatus.CREATED) async start(
    @Body() dto: StartPracticeAttemptDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(
      await this.svc.start(dto, user?.sub, user?.role),
      'Practice attempt started',
    );
  }
  @Patch(':id') async submit(
    @Param('id') id: string,
    @Body() dto: SubmitPracticeAttemptDto,
  ) {
    return ok(await this.svc.submit(id, dto), 'Practice attempt submitted');
  }
}
