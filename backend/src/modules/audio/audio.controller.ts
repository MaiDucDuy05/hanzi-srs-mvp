import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Body,
  BadRequestException,
  Logger,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

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

/** Chỉ cho phép các MIME type audio. */
const ALLOWED_MIME = new Set(Object.keys(AUDIO_MIME));

/** Key audio chỉ là tên file phẳng (không chứa path) — khớp cách frontend encodeURIComponent. */
function sanitizeKey(key: string): string | null {
  if (!key || key.includes('\0') || key.includes('/') || key.includes('\\') || key.includes('..')) {
    return null;
  }
  return /^[A-Za-z0-9._-]+$/.test(key) ? key : null;
}

function getStorageDir(config: ConfigService): string {
  return path.resolve(
    config.get<string>('AUDIO_STORAGE_DIR') ??
      path.join(process.cwd(), 'storage', 'audio'),
  );
}

/**
 * Phục vụ file audio tĩnh (FR-01).
 * Upload audio ghi âm luyện nói HSKK (FR-08) qua POST /audio/upload.
 * MVP dùng thư mục cục bộ qua AUDIO_STORAGE_DIR (mặc định ./storage/audio).
 * Khi có S3/CDN, thay bằng proxy hoặc redirect tới presigned URL.
 */
@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);
  private readonly storageDir: string;
  private readonly getStorageDirBound: () => string;

  constructor(private readonly config: ConfigService) {
    this.storageDir = getStorageDir(config);
    this.getStorageDirBound = () => this.storageDir;
  }

  // ── Phát audio (FR-01) ──────────────────────────────────────────────

  @Get(':key')
  serve(@Param('key') key: string, @Res() res: Response): void {
    const safe = sanitizeKey(key);
    if (!safe) throw new BadRequestException('Invalid audio key');

    const storageDir = getStorageDir(this.config);
    const absPath = path.join(storageDir, safe);
    if (!absPath.startsWith(storageDir + path.sep)) {
      throw new BadRequestException('Invalid audio key');
    }

    const ext = path.extname(absPath).slice(1).toLowerCase();
    res.setHeader('Content-Type', AUDIO_MIME[ext] ?? 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
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

  // ── Upload audio ghi âm (FR-08) ───────────────────────────────────

  /**
   * Upload file audio ghi âm từ luyện nói HSKK.
   * Multer đọc vào memory, controller ghi ra storage dir, trả audioKey.
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
          cb(new BadRequestException('Loại file không được hỗ trợ. Chỉ chấp nhận audio.'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const mime = file.mimetype ?? 'audio/mpeg';
    const ext = mime === 'audio/mpeg' ? 'mp3' : mime === 'audio/mp4' ? 'm4a' : 'bin';
    const audioKey = `${uuidv4()}.${ext}`;
    const absPath = path.join(this.storageDir, audioKey);
    await fs.promises.writeFile(absPath, file.buffer);
    this.logger.log(`Audio saved: ${audioKey} (${file.size} bytes)`);
    return { data: { audioKey }, message: 'Audio uploaded successfully' };
  }
}
