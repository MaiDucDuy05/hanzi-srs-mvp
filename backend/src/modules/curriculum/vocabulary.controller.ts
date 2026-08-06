import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto, UpdateVocabularyDto, VocabularyQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly svc: VocabularyService) {}
  @Get() async findAll(@Query() q: VocabularyQueryDto) { return ok(await this.svc.findAll(q), 'Vocabularies retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Vocabulary retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateVocabularyDto) { return ok(await this.svc.create(dto), 'Vocabulary created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto) { return ok(await this.svc.update(id, dto), 'Vocabulary updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}
