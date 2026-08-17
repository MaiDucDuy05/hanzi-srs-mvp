import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../../common/enums/user.enums';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto } from './dto/question.dto';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionBankController {
  constructor(private readonly svc: QuestionBankService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateQuestionDto, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.create(dto, user.sub, user.role), 'Question created');
  }

  @Get()
  @Roles(Role.TEACHER, Role.ADMIN)
  async findAll(@Query() q: QueryQuestionDto, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.findAll(q, user.sub, user.role), 'Questions retrieved');
  }

  @Get(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return ok(await this.svc.findById(id, user.sub, user.role), 'Question retrieved');
  }

  @Put(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.update(id, dto, user.sub, user.role), 'Question updated');
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.svc.delete(id, user.sub, user.role);
  }
}
