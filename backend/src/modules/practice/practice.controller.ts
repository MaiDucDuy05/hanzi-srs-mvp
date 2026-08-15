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
import { ContentStatus } from '../../common/enums/curriculum.enums';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller('practice-questions')
export class PracticeQuestionController {
  constructor(private readonly svc: PracticeQuestionService) {}
  @Get() async findAll(@Query() q: PracticeQuestionQueryDto, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.findAll(q, user?.role), 'Practice questions retrieved');
  }
  @Get(':id') async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.findById(id, user?.role), 'Practice question retrieved');
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

  /** POST /practice-questions/:id/publish — xuất bản câu hỏi */
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string) {
    return ok(await this.svc.update(id, { status: ContentStatus.PUBLISHED }), 'Practice question published');
  }
}

@Controller('practice-attempts')
export class PracticeAttemptController {
  constructor(private readonly svc: PracticeAttemptService) {}
  @Get() async findAll(
    @Query() q: PracticeAttemptQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(
      await this.svc.findAll(q, user?.sub, user?.role),
      'Practice attempts retrieved',
    );
  }
  @Get(':id') async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(
      await this.svc.findById(id, user?.sub, user?.role),
      'Practice attempt retrieved',
    );
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
    @CurrentUser('sub') userId: string,
  ) {
    return ok(
      await this.svc.submit(id, dto, userId),
      'Practice attempt submitted',
    );
  }
}
