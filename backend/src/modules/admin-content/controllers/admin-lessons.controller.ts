import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Ip } from '@nestjs/common';
import { AdminLessonsService } from '../services/admin-lessons.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminLessonsController {
  constructor(private readonly adminLessonsService: AdminLessonsService) {}

  @Get('lessons')
  async findAll(@Query() query: any) {
    const result = await this.adminLessonsService.findAll(query);
    return { data: result, message: 'All lessons retrieved successfully' };
  }

  @Get('courses/:courseId/lessons')
  async findAllByCourse(@Param('courseId') courseId: string, @Query() query: any) {
    const result = await this.adminLessonsService.findAllByCourse(courseId, query);
    return { data: result, message: 'Lessons retrieved successfully' };
  }

  @Post('courses/:courseId/lessons')
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminLessonsService.create(courseId, dto, adminId, ipAddress);
    return { data: result, message: 'Lesson created successfully' };
  }

  @Put('lessons/reorder')
  async reorder(
    @Body() dto: { items: { id: string; order: number }[] },
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminLessonsService.reorder(dto.items, adminId, ipAddress);
    return { data: result, message: 'Lessons reordered successfully' };
  }

  @Put('lessons/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminLessonsService.update(id, dto, adminId, ipAddress);
    return { data: result, message: 'Lesson updated successfully' };
  }

  @Put('lessons/:id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminLessonsService.changeStatus(id, status, adminId, ipAddress);
    return { data: result, message: 'Lesson status updated successfully' };
  }

  @Get('lesson-contents')
  async getLessonContents(@Query() query: any) {
    const result = await this.adminLessonsService.getLessonContents(query);
    return { data: result, message: 'Lesson contents retrieved successfully' };
  }

  @Post('lesson-contents')
  async addLessonContent(
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminLessonsService.addLessonContent(dto, adminId, ipAddress);
    return { data: result, message: 'Lesson content added successfully' };
  }

  @Delete('lesson-contents/:id')
  async removeLessonContent(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminLessonsService.removeLessonContent(id, adminId, ipAddress);
    return { data: result, message: 'Lesson content removed successfully' };
  }
}
