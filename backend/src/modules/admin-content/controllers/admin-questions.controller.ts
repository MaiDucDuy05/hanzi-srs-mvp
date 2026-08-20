import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Ip } from '@nestjs/common';
import { AdminQuestionsService } from '../services/admin-questions.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('admin/questions')
@Roles(Role.ADMIN)
export class AdminQuestionsController {
  constructor(private readonly adminQuestionsService: AdminQuestionsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.adminQuestionsService.findAll(query);
    return { data: result, message: 'Questions retrieved successfully' };
  }

  @Post()
  async create(
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminQuestionsService.create(dto, adminId, ipAddress);
    return { data: result, message: 'Question created successfully' };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminQuestionsService.update(id, dto, adminId, ipAddress);
    return { data: result, message: 'Question updated successfully' };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminQuestionsService.softDelete(id, adminId, ipAddress);
    return { data: result, message: 'Question deleted successfully' };
  }
}
