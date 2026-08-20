import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Ip, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminVocabulariesService } from '../services/admin-vocabularies.service';
import { CsvImportService } from '../services/csv-import.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('admin/vocabularies')
@Roles(Role.ADMIN)
export class AdminVocabulariesController {
  constructor(
    private readonly adminVocabulariesService: AdminVocabulariesService,
    private readonly csvImportService: CsvImportService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.adminVocabulariesService.findAll(query);
    return { data: result, message: 'Vocabularies retrieved successfully' };
  }

  @Post()
  async create(
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminVocabulariesService.create(dto, adminId, ipAddress);
    return { data: result, message: 'Vocabulary created successfully' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') adminId: string,
  ) {
    const result = await this.csvImportService.importVocabularies(file, adminId);
    return { data: result, message: `Imported ${result.count} vocabularies successfully` };
  }

  @Get('export')
  async exportCsv() {
    const csvContent = await this.adminVocabulariesService.exportCsv();
    return csvContent; // You may want to return this as a downloadable file, but string works for MVP
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminVocabulariesService.update(id, dto, adminId, ipAddress);
    return { data: result, message: 'Vocabulary updated successfully' };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminVocabulariesService.softDelete(id, adminId, ipAddress);
    return { data: result, message: 'Vocabulary deleted successfully' };
  }

  @Post(':id/audio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    const result = await this.adminVocabulariesService.uploadAudio(id, file, adminId, ipAddress);
    return { data: result, message: 'Audio uploaded successfully' };
  }
}
