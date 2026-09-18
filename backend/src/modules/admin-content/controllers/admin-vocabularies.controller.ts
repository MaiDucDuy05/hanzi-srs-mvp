import { Controller, Get, Post, Put, Delete, Param, Body, Query, Ip, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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

  @Post('bulk-create')
  async bulkCreate(
    @Body() dtos: any[],
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    if (!Array.isArray(dtos)) {
      throw new BadRequestException('Body must be an array of vocabularies');
    }
    // Note: To be efficient, we can either use save() on array or loop. 
    // Since adminVocabulariesService.create might do extra logic (audit logs, etc), 
    // looping is safer but might be slow for huge arrays. For MVP it is fine.
    const results = [];
    for (const dto of dtos) {
      results.push(await this.adminVocabulariesService.create(dto, adminId, ipAddress));
    }
    return { data: { ids: results.map((r: any) => r.id), count: results.length }, message: `Bulk created ${results.length} vocabularies` };
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

  @Post('bulk-delete')
  async bulkRemove(
    @Body() body: { ids: string[] },
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    if (!body?.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('Danh sách id từ vựng cần xóa không hợp lệ');
    }
    const result = await this.adminVocabulariesService.bulkSoftDelete(body.ids, adminId, ipAddress);
    return { data: result, message: `Đã xóa thành công ${result.count} từ vựng` };
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
