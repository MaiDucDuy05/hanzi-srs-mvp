import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Ip } from '@nestjs/common';
import { AdminGrammarsService } from '../services/admin-grammars.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('admin/grammars')
@Roles(Role.ADMIN)
export class AdminGrammarsController {
  constructor(private readonly adminGrammarsService: AdminGrammarsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.adminGrammarsService.findAll(query);
    return { data: result, message: 'Grammars retrieved successfully' };
  }

  @Post()
  async create(
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminGrammarsService.create(dto, adminId, ipAddress);
    return { data: result, message: 'Grammar created successfully' };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminGrammarsService.update(id, dto, adminId, ipAddress);
    return { data: result, message: 'Grammar updated successfully' };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    await this.adminGrammarsService.remove(id, adminId, ipAddress);
    return { message: 'Grammar deleted successfully' };
  }
}
