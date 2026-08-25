import { Controller, Get, Param, Query } from '@nestjs/common';
import { GrammarPointService } from './grammar-point.service';
import { GrammarPointQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('grammar-points')
export class GrammarPointController {
  constructor(private readonly svc: GrammarPointService) {}
  @Get() async findAll(@Query() q: GrammarPointQueryDto) { return ok(await this.svc.findAll(q), 'Grammar points retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Grammar point retrieved'); }
}
