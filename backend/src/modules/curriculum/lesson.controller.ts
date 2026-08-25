import { Controller, Get, Param, Query } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonQueryDto } from './dto/curriculum.dto';

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
}
