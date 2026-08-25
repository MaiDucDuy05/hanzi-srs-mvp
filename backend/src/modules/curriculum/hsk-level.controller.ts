import { Controller, Get, Param, Query } from '@nestjs/common';
import { HskLevelService } from './hsk-level.service';
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
}
