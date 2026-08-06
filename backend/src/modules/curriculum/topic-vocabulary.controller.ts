import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TopicVocabularyService } from './topic-vocabulary.service';
import { CreateTopicVocabularyDto, UpdateTopicVocabularyDto, TopicVocabularyQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('topic-vocabularies')
export class TopicVocabularyController {
  constructor(private readonly svc: TopicVocabularyService) {}
  @Get() async findAll(@Query() q: TopicVocabularyQueryDto) { return ok(await this.svc.findAll(q), 'Topic vocabularies retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Topic vocabulary retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateTopicVocabularyDto) { return ok(await this.svc.create(dto), 'Topic vocabulary created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateTopicVocabularyDto) { return ok(await this.svc.update(id, dto), 'Topic vocabulary updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.delete(id); }
}
