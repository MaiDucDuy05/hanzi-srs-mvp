import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/** Các MIME type audio được phép upload. */
const ALLOWED_MIME_TYPES = new Set([
  'audio/mpeg',    // .mp3
  'audio/mp4',     // .m4a
  'audio/wav',     // .wav
  'audio/x-wav',   // .wav alternative
  'audio/ogg',     // .ogg
  'audio/webm',    // .webm
  'audio/aac',     // .aac
  'audio/flac',    // .flac
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class AudioStorageService {
  private readonly storageDir: string;

  constructor(private readonly config: ConfigService) {
    this.storageDir = path.resolve(
      this.config.get<string>('AUDIO_STORAGE_DIR') ??
        path.join(process.cwd(), 'storage', 'audio'),
    );
    // Tạo thư mục lưu trữ nếu chưa có
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Lưu file audio vào storage.
   * @param file Buffer của file upload
   * @param mimeType MIME type đã xác thực
   * @returns audioKey (tên file đã sanitize)
   */
  async save(file: Express.Multer.File, mimeType: string): Promise<string> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        `Loại file không được hỗ trợ. Chỉ chấp nhận: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File quá lớn. Tối đa ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
    }

    // Lấy extension từ mime type
    const ext = this.mimeToExt(mimeType);
    const audioKey = `${uuidv4()}.${ext}`;
    const absPath = path.join(this.storageDir, audioKey);

    fs.writeFileSync(absPath, file.buffer);
    return audioKey;
  }

  private mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'audio/aac': 'aac',
      'audio/flac': 'flac',
    };
    return map[mimeType] ?? 'bin';
  }
}
