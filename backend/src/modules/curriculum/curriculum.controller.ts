import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import {
  HskLevelService, VocabularyService, GrammarPointService,
  LessonService, LessonContentService, TopicService, TopicVocabularyService,
} from './curriculum.service';
import {
  CreateHskLevelDto, UpdateHskLevelDto,
  CreateVocabularyDto, UpdateVocabularyDto,
  CreateGrammarPointDto, UpdateGrammarPointDto,
  CreateLessonDto, UpdateLessonDto,
  CreateLessonContentDto, UpdateLessonContentDto,
  CreateTopicDto, UpdateTopicDto,
  CreateTopicVocabularyDto, UpdateTopicVocabularyDto,
} from './dto/curriculum.dto';
import { PaginationQueryDto } from '../../common/pagination.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

// ---- HskLevel ----
@Controller('hsk-levels')
export class HskLevelController {
  constructor(private readonly svc: HskLevelService) {}
  @Get() async findAll(@Query() q: PaginationQueryDto) { return ok(await this.svc.findAll(q), 'HSK levels retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'HSK level retrieved'); }
  @Post() async create(@Body() dto: CreateHskLevelDto) { return ok(await this.svc.create(dto), 'HSK level created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateHskLevelDto) { return ok(await this.svc.update(id, dto), 'HSK level updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.delete(id); return ok(null, 'HSK level deleted'); }
}

// ---- Vocabulary ----
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly svc: VocabularyService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Vocabularies retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Vocabulary retrieved'); }
  @Post() async create(@Body() dto: CreateVocabularyDto) { return ok(await this.svc.create(dto), 'Vocabulary created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto) { return ok(await this.svc.update(id, dto), 'Vocabulary updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Vocabulary deleted'); }
}

// ---- GrammarPoint ----
@Controller('grammar-points')
export class GrammarPointController {
  constructor(private readonly svc: GrammarPointService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Grammar points retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Grammar point retrieved'); }
  @Post() async create(@Body() dto: CreateGrammarPointDto) { return ok(await this.svc.create(dto), 'Grammar point created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateGrammarPointDto) { return ok(await this.svc.update(id, dto), 'Grammar point updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Grammar point deleted'); }
}

// ---- Lesson ----
@Controller('lessons')
export class LessonController {
  constructor(private readonly svc: LessonService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Lessons retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Lesson retrieved'); }
  @Post() async create(@Body() dto: CreateLessonDto) { return ok(await this.svc.create(dto), 'Lesson created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateLessonDto) { return ok(await this.svc.update(id, dto), 'Lesson updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Lesson deleted'); }
}

// ---- LessonContent ----
@Controller('lesson-contents')
export class LessonContentController {
  constructor(private readonly svc: LessonContentService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Lesson contents retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Lesson content retrieved'); }
  @Post() async create(@Body() dto: CreateLessonContentDto) { return ok(await this.svc.create(dto), 'Lesson content created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateLessonContentDto) { return ok(await this.svc.update(id, dto), 'Lesson content updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.delete(id); return ok(null, 'Lesson content deleted'); }
}

// ---- Topic ----
@Controller('topics')
export class TopicController {
  constructor(private readonly svc: TopicService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Topics retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Topic retrieved'); }
  @Post() async create(@Body() dto: CreateTopicDto) { return ok(await this.svc.create(dto), 'Topic created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateTopicDto) { return ok(await this.svc.update(id, dto), 'Topic updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Topic deleted'); }
}

// ---- TopicVocabulary ----
@Controller('topic-vocabularies')
export class TopicVocabularyController {
  constructor(private readonly svc: TopicVocabularyService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Topic vocabularies retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Topic vocabulary retrieved'); }
  @Post() async create(@Body() dto: CreateTopicVocabularyDto) { return ok(await this.svc.create(dto), 'Topic vocabulary created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateTopicVocabularyDto) { return ok(await this.svc.update(id, dto), 'Topic vocabulary updated'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.delete(id); return ok(null, 'Topic vocabulary deleted'); }
}
