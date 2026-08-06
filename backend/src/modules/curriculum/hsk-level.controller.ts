import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { HskLevelService } from './hsk-level.service';
import { CreateHskLevelDto, UpdateHskLevelDto } from './dto/curriculum.dto';
import { PaginationQueryDto } from '../../common/pagination.dto';

function ok(data: any, message: string) {
  if (data?.meta) return { ...data, message };
  return { data, message };
}

@Controller('hsk-levels')
export class HskLevelController {
  constructor(private readonly svc: HskLevelService) {}
  @Get() async findAll(@Query() q: PaginationQueryDto) { return ok(await this.svc.findAll(q), 'HSK levels retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'HSK level retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateHskLevelDto) { return ok(await this.svc.create(dto), 'HSK level created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateHskLevelDto) { return ok(await this.svc.update(id, dto), 'HSK level updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.delete(id); }
}
