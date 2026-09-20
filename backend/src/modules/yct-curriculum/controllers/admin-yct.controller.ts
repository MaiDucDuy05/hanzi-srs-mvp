import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminYctService } from '../services/admin-yct.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import {
  CreateYctLessonDto,
  CreateYctVocabularyDto,
  UpdateYctLessonDto,
  UpdateYctVocabularyDto,
  YctLessonQueryDto,
  YctVocabularyQueryDto,
} from '../dto/yct-curriculum.dto';

@Controller('admin/yct')
@Roles(Role.ADMIN)
export class AdminYctController {
  constructor(private readonly adminYctService: AdminYctService) {}

  // ── Levels ────────────────────────────────────────────────────────────────
  @Get('levels')
  async getLevels() {
    const data = await this.adminYctService.getLevels();
    return { data, message: 'Danh sách cấp độ YCT' };
  }

  @Put('levels/:id')
  async updateLevel(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    const data = await this.adminYctService.updateLevel(id, body, adminId, ip);
    return { data, message: 'Cập nhật cấp độ YCT thành công' };
  }

  // ── Lessons ───────────────────────────────────────────────────────────────
  @Get('lessons')
  async getLessons(@Query() query: YctLessonQueryDto) {
    const data = await this.adminYctService.getLessons(query);
    return { data, message: 'Danh sách bài học YCT' };
  }

  @Get('lessons/:id')
  async getLesson(@Param('id') id: string) {
    const data = await this.adminYctService.getLesson(id);
    return { data, message: 'Chi tiết bài học YCT' };
  }

  @Post('lessons')
  async createLesson(
    @Body() dto: CreateYctLessonDto,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    const data = await this.adminYctService.createLesson(dto, adminId, ip);
    return { data, message: 'Tạo bài học YCT thành công' };
  }

  @Put('lessons/:id')
  async updateLesson(
    @Param('id') id: string,
    @Body() dto: UpdateYctLessonDto,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    const data = await this.adminYctService.updateLesson(id, dto, adminId, ip);
    return { data, message: 'Cập nhật bài học YCT thành công' };
  }

  @Delete('lessons/:id')
  async deleteLesson(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    await this.adminYctService.deleteLesson(id, adminId, ip);
    return { message: 'Xoá bài học YCT thành công' };
  }

  // ── Vocabularies ──────────────────────────────────────────────────────────
  @Get('vocabularies')
  async getVocabularies(@Query() query: YctVocabularyQueryDto) {
    const data = await this.adminYctService.getVocabularies(query);
    return { data, message: 'Danh sách từ vựng YCT' };
  }

  @Get('vocabularies/:id')
  async getVocabulary(@Param('id') id: string) {
    const data = await this.adminYctService.getVocabulary(id);
    return { data, message: 'Chi tiết từ vựng YCT' };
  }

  @Post('vocabularies')
  async createVocabulary(
    @Body() dto: CreateYctVocabularyDto,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    const data = await this.adminYctService.createVocabulary(dto, adminId, ip);
    return { data, message: 'Tạo từ vựng YCT thành công' };
  }

  @Put('vocabularies/:id')
  async updateVocabulary(
    @Param('id') id: string,
    @Body() dto: UpdateYctVocabularyDto,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    const data = await this.adminYctService.updateVocabulary(id, dto, adminId, ip);
    return { data, message: 'Cập nhật từ vựng YCT thành công' };
  }

  @Delete('vocabularies/:id')
  async deleteVocabulary(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ip: string,
  ) {
    await this.adminYctService.deleteVocabulary(id, adminId, ip);
    return { message: 'Xoá từ vựng YCT thành công' };
  }

  // ── Upload Image to S3 ────────────────────────────────────────────────────
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file hình ảnh');
    const url = await this.adminYctService.uploadImage(file);
    return { data: { url }, message: 'Tải ảnh minh hoạ YCT lên S3 thành công' };
  }
}
