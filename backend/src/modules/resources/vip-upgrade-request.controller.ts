import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { VipUpgradeService } from './vip-upgrade-request.service';
import * as DTO from './dto/resources.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';


function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('vip-upgrade-requests')

export class VipUpgradeController {
  constructor(private readonly svc: VipUpgradeService) {}
  
  @Get() 
  @Roles(Role.ADMIN) 
  async findAll(@Query() q: DTO.VipUpgradeRequestQueryDto) { 
    return ok(await this.svc.findAll(q), 'VIP upgrade requests retrieved'); 
  }
  
  @Get(':id') 
  async findOne(@Param('id') id: string) { 
    return ok(await this.svc.findById(id), 'VIP upgrade request retrieved'); 
  }
  
  @Post() 
  @HttpCode(HttpStatus.CREATED) 
  async create(@Body() dto: DTO.CreateVipUpgradeRequestDto) { 
    return ok(await this.svc.create(dto), 'VIP upgrade request created'); 
  }
  
  @Patch(':id') 
  @Roles(Role.ADMIN) 
  async review(
    @Param('id') id: string, 
    @Body() dto: DTO.ReviewVipUpgradeDto, 
    @CurrentUser('sub') reviewedBy: string
  ) { 
    return ok(await this.svc.review(id, dto, reviewedBy), 'VIP upgrade request reviewed'); 
  }
}
