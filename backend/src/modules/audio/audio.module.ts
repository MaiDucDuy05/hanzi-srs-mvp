import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { AudioStorageService } from './audio-storage.service';

/**
 * Module phục vụ audio tĩnh (FR-01). MVP đọc file từ AUDIO_STORAGE_DIR;
 * khi có S3/CDN, thay controller bằng proxy hoặc redirect tới URL đã ký.
 *
 * FR-08: Upload audio ghi âm luyện nói HSKK cũng qua module này.
 */
@Module({
  controllers: [AudioController],
  providers: [AudioStorageService],
  exports: [AudioStorageService],
})
export class AudioModule {}
