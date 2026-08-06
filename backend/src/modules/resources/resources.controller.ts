import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ResourceService, AiJobService, ContactService, MistakeBookService, SpeakingService, VipUpgradeService } from './resources.service';
import * as DTO from './dto/resources.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('resources')
export class ResourceController {
  constructor(private readonly svc: ResourceService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Resources retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Resource retrieved'); }
  @Post() @Roles(Role.TEACHER, Role.ADMIN) async create(@Body() dto: DTO.CreateResourceDto) { return ok(await this.svc.create(dto), 'Resource created'); }
  @Patch(':id') @Roles(Role.TEACHER, Role.ADMIN) async update(@Param('id') id: string, @Body() dto: DTO.UpdateResourceDto) { return ok(await this.svc.update(id, dto), 'Resource updated'); }
  @Delete(':id') @Roles(Role.ADMIN) async remove(@Param('id') id: string) { await this.svc.softDelete(id); return ok(null, 'Resource deleted'); }
}

@Controller('ai-jobs')
export class AiJobController {
  constructor(private readonly svc: AiJobService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'AI jobs retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'AI job retrieved'); }
  @Post() async create(@Body() dto: DTO.CreateAiJobDto) { return ok(await this.svc.create(dto), 'AI job created'); }
}

@Controller('contact-requests')
export class ContactController {
  constructor(private readonly svc: ContactService) {}
  @Public()
  @Post() async create(@Body() dto: DTO.CreateContactRequestDto) { return ok(await this.svc.create(dto), 'Contact request sent'); }
  @Get() @Roles(Role.ADMIN) async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Contact requests retrieved'); }
  @Patch(':id') @Roles(Role.ADMIN) async update(@Param('id') id: string, @Body() dto: DTO.UpdateContactRequestDto) { return ok(await this.svc.update(id, dto), 'Contact request updated'); }
}

@Controller('mistake-book')
export class MistakeBookController {
  constructor(private readonly svc: MistakeBookService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Mistake book entries retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Mistake book entry retrieved'); }
  @Post() async create(@Body() dto: DTO.CreateMistakeBookDto) { return ok(await this.svc.create(dto), 'Mistake book entry created'); }
  @Delete(':id') async remove(@Param('id') id: string) { await this.svc.delete(id); return ok(null, 'Mistake book entry deleted'); }
}

@Controller('speaking-attempts')
export class SpeakingController {
  constructor(private readonly svc: SpeakingService) {}
  @Get() async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'Speaking attempts retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Speaking attempt retrieved'); }
  @Post() async create(@Body() dto: DTO.CreateSpeakingAttemptDto) { return ok(await this.svc.create(dto), 'Speaking attempt created'); }
  @Post(':id/grade') @Roles(Role.TEACHER, Role.ADMIN) async grade(@Param('id') id: string, @Body() dto: DTO.GradeSpeakingDto, @CurrentUser('sub') gradedBy: string) { return ok(await this.svc.grade(id, dto, gradedBy), 'Speaking attempt graded'); }
}

@Controller('vip-upgrade-requests')
export class VipUpgradeController {
  constructor(private readonly svc: VipUpgradeService) {}
  @Get() @Roles(Role.ADMIN) async findAll(@Query() q: any) { return ok(await this.svc.findAll(q), 'VIP upgrade requests retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'VIP upgrade request retrieved'); }
  @Post() async create(@Body() dto: DTO.CreateVipUpgradeRequestDto) { return ok(await this.svc.create(dto), 'VIP upgrade request created'); }
  @Post(':id/review') @Roles(Role.ADMIN) async review(@Param('id') id: string, @Body() dto: DTO.ReviewVipUpgradeDto, @CurrentUser('sub') reviewedBy: string) { return ok(await this.svc.review(id, dto, reviewedBy), 'VIP upgrade request reviewed'); }
}
