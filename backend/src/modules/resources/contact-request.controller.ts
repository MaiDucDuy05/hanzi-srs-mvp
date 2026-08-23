import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact-request.service';
import * as DTO from './dto/resources.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('contact-requests')
export class ContactController {
  constructor(private readonly svc: ContactService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 86400000 } }) // Max 3 requests per day per IP
  @Post() 
  @HttpCode(HttpStatus.CREATED) 
  async create(@Body() dto: DTO.CreateContactRequestDto) { 
    return ok(await this.svc.create(dto), 'Contact request sent'); 
  }

  @Get() 
  @Roles(Role.ADMIN) 
  async findAll(@Query() q: DTO.ContactRequestQueryDto) { 
    return ok(await this.svc.findAll(q), 'Contact requests retrieved'); 
  }

  @Patch(':id') 
  @Roles(Role.ADMIN) 
  async update(@Param('id') id: string, @Body() dto: DTO.UpdateContactRequestDto) { 
    return ok(await this.svc.update(id, dto), 'Contact request updated'); 
  }

  @Post(':id/reply')
  @Roles(Role.ADMIN)
  async reply(@Param('id') id: string, @Body() dto: DTO.ReplyContactDto) {
    return ok(await this.svc.reply(id, dto.replyMessage), 'Reply sent successfully');
  }
}
