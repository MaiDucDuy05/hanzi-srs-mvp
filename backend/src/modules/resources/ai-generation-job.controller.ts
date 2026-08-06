import { Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AiJobService } from './ai-generation-job.service';
import * as DTO from './dto/resources.dto';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('ai-jobs')
export class AiJobController {
  constructor(private readonly svc: AiJobService) {}
  @Get() async findAll(@Query() q: DTO.AiJobQueryDto) { return ok(await this.svc.findAll(q), 'AI jobs retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'AI job retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: DTO.CreateAiJobDto) { return ok(await this.svc.create(dto), 'AI job created'); }
}
