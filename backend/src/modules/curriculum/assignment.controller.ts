import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, UpdateAssignmentDto, AssignmentQueryDto } from './dto/assignment.dto';

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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAssignmentDto) {
    return ok(await this.svc.create(dto), 'Assignment created');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return ok(await this.svc.update(id, dto), 'Assignment updated');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.svc.delete(id);
  }
}
