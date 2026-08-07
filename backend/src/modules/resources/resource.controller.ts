import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ResourceService } from './resource.service';
import * as DTO from './dto/resources.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('resources')
export class ResourceController {
  constructor(private readonly svc: ResourceService) {}
  @Get() async findAll(
    @Query() q: DTO.ResourceQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.findAll(q, user?.sub, user?.role), 'Resources retrieved');
  }
  @Get(':id') async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.findById(id, user?.sub, user?.role), 'Resource retrieved');
  }
  @Post() @Roles(Role.TEACHER, Role.ADMIN) @HttpCode(HttpStatus.CREATED) async create(@Body() dto: DTO.CreateResourceDto) { return ok(await this.svc.create(dto), 'Resource created'); }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: DTO.UpdateResourceDto) { return ok(await this.svc.update(id, dto), 'Resource updated'); }
  @Delete(':id') @Roles(Role.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}
