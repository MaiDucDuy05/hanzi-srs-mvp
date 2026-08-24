import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ResourceService } from './resource.service';
import * as DTO from './dto/resources.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
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

  @Get(':id/download-url') async getDownloadUrl(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return ok(await this.svc.getDownloadUrl(id, user?.sub, user?.role), 'Download URL generated');
  }

  @Public()
  @Get('public/*')
  async getPublicFile(@Req() req: Request, @Res() res: Response) {
    let key: string | undefined;
    const param = req.params[0] || req.params.path;
    
    if (Array.isArray(param)) {
      key = param.join('/');
    } else if (typeof param === 'string') {
      key = param;
    }

    if (!key) {
      const parts = req.url.split('/public/');
      if (parts.length > 1) {
        key = parts[1].split('?')[0];
      }
    }
    
    if (!key) {
      return res.status(400).send('Missing file key');
    }
    const url = await this.svc.getPublicDownloadUrl(key);
    res.redirect(url);
  }

  @Post('upload-request') 
  @Roles(Role.TEACHER, Role.ADMIN) 
  @HttpCode(HttpStatus.OK)
  async requestUploadUrl(@Body() body: { fileName: string; contentType: string }) {
    const key = `resources/${Date.now()}-${body.fileName}`;
    return ok(await this.svc.getUploadUrl(key, body.contentType), 'Upload URL generated');
  }

  @Post() 
  @Roles(Role.TEACHER, Role.ADMIN) 
  @HttpCode(HttpStatus.CREATED) 
  async create(@Body() dto: DTO.CreateResourceDto, @CurrentUser() user: JwtPayload) { 
    dto.uploaderId = user.sub;
    return ok(await this.svc.create(dto), 'Resource created'); 
  }
  
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: DTO.UpdateResourceDto) { return ok(await this.svc.update(id, dto), 'Resource updated'); }
  @Delete(':id') @Roles(Role.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}
