import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('lessons')
export class LessonController {
  constructor(private readonly svc: LessonService) {}
  @Get() async findAll(@Query() q: LessonQueryDto) { return ok(await this.svc.findAll(q), 'Lessons retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Lesson retrieved'); }
  @Get(':id/contents') async getContents(@Param('id') id: string) { return ok(await this.svc.getContents(id), 'Lesson contents retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateLessonDto) { return ok(await this.svc.create(dto), 'Lesson created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateLessonDto) { return ok(await this.svc.update(id, dto), 'Lesson updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}
