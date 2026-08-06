import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto, UpdateTopicDto, TopicQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('topics')
export class TopicController {
  constructor(private readonly svc: TopicService) {}
  @Get() async findAll(@Query() q: TopicQueryDto) { return ok(await this.svc.findAll(q), 'Topics retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Topic retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateTopicDto) { return ok(await this.svc.create(dto), 'Topic created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateTopicDto) { return ok(await this.svc.update(id, dto), 'Topic updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}
