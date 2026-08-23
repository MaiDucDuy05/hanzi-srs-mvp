import { Controller, Get, Param, Query } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('topics')
export class TopicController {
  constructor(private readonly svc: TopicService) {}
  @Get() async findAll(@Query() q: TopicQueryDto) { return ok(await this.svc.findAll(q), 'Topics retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Topic retrieved'); }
}
