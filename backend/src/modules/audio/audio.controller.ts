import {
  Controller,
  Get,
  Param,
  Res,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Public } from '../auth/decorators/public.decorator';

/** Content-Type theo extension (FR-01: phát âm từ vựng). */
const AUDIO_MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
  aac: 'audio/aac',
  flac: 'audio/flac',
};

/** Key audio chỉ là tên file phẳng (không chứa path) — khớp cách frontend encodeURIComponent. */
function sanitizeKey(key: string): string | null {
  if (
    !key ||
    key.includes('\0') ||
    key.includes('/') ||
    key.includes('\\') ||
    key.includes('..')
  ) {
    return null;
  }
  return /^[A-Za-z0-9._-]+$/.test(key) ? key : null;
}

/**
 * Phục vụ file audio tĩnh (PR: chưa có S3/CDN — dùng thư mục cục bộ cho MVP).
 * Thư mục gốc cấu hình qua env AUDIO_STORAGE_DIR (mặc định ./storage/audio).
 * res.sendFile của Express tự hỗ trợ Range request (seek audio) và 404.
 */
@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);
  private readonly storageDir: string;

  constructor(private readonly config: ConfigService) {
    this.storageDir = path.resolve(
      this.config.get<string>('AUDIO_STORAGE_DIR') ??
        path.join(process.cwd(), 'storage', 'audio'),
    );
  }

  @Public()
  @Get(':key')
  serve(@Param('key') key: string, @Res() res: Response): void {
    const safe = sanitizeKey(key);
    if (!safe) throw new BadRequestException('Invalid audio key');

    const absPath = path.join(this.storageDir, safe);
    // Chặn thoát khỏi thư mục storage (belt-and-braces dù sanitizeKey đã chặn path).
    if (!absPath.startsWith(this.storageDir + path.sep)) {
      throw new BadRequestException('Invalid audio key');
    }

    const ext = path.extname(absPath).slice(1).toLowerCase();
    res.setHeader(
      'Content-Type',
      AUDIO_MIME[ext] ?? 'application/octet-stream',
    );
    res.setHeader('Accept-Ranges', 'bytes');
    // TTL ngắn để khi upload file mới không bị cache cũ.
    res.setHeader('Cache-Control', 'public, max-age=300');

    res.sendFile(absPath, (err) => {
      if (!err) return;
      if (!res.headersSent) {
        res.status(404).json({ data: null, message: 'Audio not found' });
      } else {
        this.logger.warn(`Audio stream error ${safe}: ${err.message}`);
      }
    });
  }
}
