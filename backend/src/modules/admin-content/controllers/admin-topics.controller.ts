import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Ip } from '@nestjs/common';
import { AdminTopicsService } from '../services/admin-topics.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('v1/admin/topics')
@Roles(Role.ADMIN)
export class AdminTopicsController {
  constructor(private readonly adminTopicsService: AdminTopicsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.adminTopicsService.findAll(query);
    return { data: result, message: 'Topics retrieved successfully' };
  }

  @Post()
  async create(
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminTopicsService.create(dto, adminId, ipAddress);
    return { data: result, message: 'Topic created successfully' };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminTopicsService.update(id, dto, adminId, ipAddress);
    return { data: result, message: 'Topic updated successfully' };
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminTopicsService.updateStatus(id, status, adminId, ipAddress);
    return { data: result, message: 'Topic status updated successfully' };
  }

  @Get(':id/vocabularies')
  async getTopicVocabularies(@Param('id') id: string) {
    const result = await this.adminTopicsService.getTopicVocabularies(id);
    return { data: result, message: 'Topic vocabularies retrieved successfully' };
  }

  @Post(':id/vocabularies')
  async assignVocabularies(
    @Param('id') id: string,
    @Body('vocabularyIds') vocabularyIds: string[],
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminTopicsService.assignVocabularies(id, vocabularyIds, adminId, ipAddress);
    return { data: result, message: 'Vocabularies assigned successfully' };
  }

  @Put(':id/vocabularies/:vocabId') // Using PUT or DELETE, NestJS DELETE often has body issues but here we just pass param
  async removeVocabulary(
    @Param('id') id: string,
    @Param('vocabId') vocabId: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminTopicsService.removeVocabulary(id, vocabId, adminId, ipAddress);
    return { data: result, message: 'Vocabulary removed successfully' };
  }
}
