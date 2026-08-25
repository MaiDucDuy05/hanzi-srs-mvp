import { Controller, Get, Param, Query } from '@nestjs/common';
import { LessonContentService } from './lesson-content.service';
import { LessonContentQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('lesson-contents')
export class LessonContentController {
  constructor(private readonly svc: LessonContentService) {}
  @Get() async findAll(@Query() q: LessonContentQueryDto) { return ok(await this.svc.findAll(q), 'Lesson contents retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Lesson content retrieved'); }
}
