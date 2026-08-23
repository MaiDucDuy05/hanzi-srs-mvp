import { Controller, Get, Param, Query } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { VocabularyQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly svc: VocabularyService) {}
  @Get() async findAll(@Query() q: VocabularyQueryDto) { return ok(await this.svc.findAll(q), 'Vocabularies retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Vocabulary retrieved'); }
}
