import { Controller, Get, Post, Param, Body, Query, UseGuards, Ip } from '@nestjs/common';
import { AdminTeacherContentService } from '../services/admin-teacher-content.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('admin/teacher-content')
@Roles(Role.ADMIN)
export class AdminTeacherContentController {
  constructor(private readonly teacherContentService: AdminTeacherContentService) {}

  @Get()
  async findAll(@Query() query: any) {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;
    
    const search = query.search || '';
    
    return this.teacherContentService.findAll({
      search,
      type: query.type,
      authorId: query.authorId,
      status: query.status,
      limit,
      offset,
    });
  }

  @Get(':type/:id')
  async findOne(
    @Param('type') type: string,
    @Param('id') id: string
  ) {
    return this.teacherContentService.findOne(type, id);
  }

  @Post(':type/:id/hide')
  async hideContent(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string
  ) {
    return this.teacherContentService.hideContent(type, id, reason, adminId, ipAddress);
  }

  @Post(':type/:id/unhide')
  async unhideContent(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string
  ) {
    return this.teacherContentService.unhideContent(type, id, adminId, ipAddress);
  }

  @Post(':type/:id/delete') // Using POST to avoid DELETE payload issues, or we can use DELETE
  async softDeleteContent(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string
  ) {
    return this.teacherContentService.softDelete(type, id, adminId, ipAddress);
  }
}
