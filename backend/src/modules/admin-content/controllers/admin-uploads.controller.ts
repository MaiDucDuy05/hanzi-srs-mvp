import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3UploadService } from '../services/s3-upload.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';

@Controller('v1/admin/uploads')
@Roles(Role.ADMIN)
export class AdminUploadsController {
  constructor(private readonly s3UploadService: S3UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file provided');
    }
    const url = await this.s3UploadService.uploadFile(file, 'hanzi-srs/admin-uploads');
    return { data: { url }, message: 'File uploaded successfully' };
  }
}
