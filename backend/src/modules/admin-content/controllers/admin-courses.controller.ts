import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminCoursesService } from '../services/admin-courses.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('admin/courses')
@Roles(Role.ADMIN)
export class AdminCoursesController {
  constructor(private readonly adminCoursesService: AdminCoursesService) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.adminCoursesService.findAll(query);
    return { data: result, message: 'Courses retrieved successfully' };
  }

  @Post()
  async create(
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminCoursesService.create(dto, adminId, ipAddress);
    return { data: result, message: 'Course created successfully' };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminCoursesService.update(id, dto, adminId, ipAddress);
    return { data: result, message: 'Course updated successfully' };
  }

  @Put(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminCoursesService.changeStatus(id, status, adminId, ipAddress);
    return { data: result, message: 'Course status updated successfully' };
  }
}
