import { Controller, Get, Param, Query } from '@nestjs/common';
import { TopicVocabularyService } from './topic-vocabulary.service';
import { TopicVocabularyQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('topic-vocabularies')
export class TopicVocabularyController {
  constructor(private readonly svc: TopicVocabularyService) {}
  @Get() async findAll(@Query() q: TopicVocabularyQueryDto) { return ok(await this.svc.findAll(q), 'Topic vocabularies retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Topic vocabulary retrieved'); }
}
