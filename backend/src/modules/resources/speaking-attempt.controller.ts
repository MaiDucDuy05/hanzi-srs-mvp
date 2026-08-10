import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SpeakingService } from './speaking-attempt.service';
import * as DTO from './dto/resources.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('speaking-attempts')
export class SpeakingController {
  constructor(private readonly svc: SpeakingService) {}
  @Get() async findAll(@Query() q: DTO.SpeakingAttemptQueryDto) { return ok(await this.svc.findAll(q), 'Speaking attempts retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Speaking attempt retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: DTO.CreateSpeakingAttemptDto, @CurrentUser('sub') userId: string) {
    return ok(await this.svc.create(dto, userId), 'Speaking attempt created');
  }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async grade(@Param('id') id: string, @Body() dto: DTO.GradeSpeakingDto, @CurrentUser('sub') gradedBy: string) { return ok(await this.svc.grade(id, dto, gradedBy), 'Speaking attempt graded'); }
}
