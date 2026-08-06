import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { GrammarPointService } from './grammar-point.service';
import { CreateGrammarPointDto, UpdateGrammarPointDto, GrammarPointQueryDto } from './dto/curriculum.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('grammar-points')
export class GrammarPointController {
  constructor(private readonly svc: GrammarPointService) {}
  @Get() async findAll(@Query() q: GrammarPointQueryDto) { return ok(await this.svc.findAll(q), 'Grammar points retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Grammar point retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateGrammarPointDto) { return ok(await this.svc.create(dto), 'Grammar point created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateGrammarPointDto) { return ok(await this.svc.update(id, dto), 'Grammar point updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}
