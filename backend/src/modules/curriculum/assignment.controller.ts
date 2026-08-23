import { Controller, Get, Param, Query } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentQueryDto } from './dto/assignment.dto';

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly svc: AssignmentService) {}

  @Get()
  async findAll(@Query() q: AssignmentQueryDto) {
    return ok(await this.svc.findAll(q), 'Assignments retrieved');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return ok(await this.svc.findById(id), 'Assignment retrieved');
  }
}
