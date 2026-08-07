import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';

/**
 * Module phục vụ audio tĩnh (FR-01). MVP đọc file từ AUDIO_STORAGE_DIR;
 * khi có S3/CDN, thay controller bằng proxy hoặc redirect tới URL đã ký.
 */
@Module({
  controllers: [AudioController],
})
export class AudioModule {}
