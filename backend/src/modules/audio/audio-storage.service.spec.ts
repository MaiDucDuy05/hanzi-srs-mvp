import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioStorageService } from './audio-storage.service';

describe('AudioStorageService', () => {
  let service: AudioStorageService;

  const createMockConfigService = (storageDir?: string) => ({
    get: jest.fn().mockReturnValue(storageDir),
  });

  const createMockFile = (size: number, buffer?: Buffer): Express.Multer.File => ({
    fieldname: 'audio',
    originalname: 'test.mp3',
    encoding: '7bit',
    mimetype: 'audio/mpeg',
    size,
    buffer: buffer || Buffer.alloc(size),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  beforeEach(() => {
    // Mock fs module
    jest.mock('fs', () => ({
      existsSync: jest.fn().mockReturnValue(true),
      mkdirSync: jest.fn(),
      writeFileSync: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save valid audio file', async () => {
      const mockConfig = createMockConfigService();
      service = new AudioStorageService(mockConfig as any);

      const file = createMockFile(1024 * 1024); // 1MB
      const result = await service.save(file, 'audio/mpeg');

      expect(result).toMatch(/\.mp3$/);
    });

    it('should throw BadRequestException for unsupported mime type', async () => {
      const mockConfig = createMockConfigService();
      service = new AudioStorageService(mockConfig as any);

      const file = createMockFile(1024);

      await expect(service.save(file, 'video/mp4')).rejects.toThrow(BadRequestException);
      await expect(service.save(file, 'video/mp4')).rejects.toThrow('Loại file không được hỗ trợ');
    });

    it('should throw BadRequestException for file too large', async () => {
      const mockConfig = createMockConfigService();
      service = new AudioStorageService(mockConfig as any);

      const file = createMockFile(11 * 1024 * 1024); // 11MB

      await expect(service.save(file, 'audio/mpeg')).rejects.toThrow(BadRequestException);
      await expect(service.save(file, 'audio/mpeg')).rejects.toThrow('File quá lớn');
    });

    it('should accept various supported audio formats', async () => {
      const mockConfig = createMockConfigService();
      service = new AudioStorageService(mockConfig as any);

      const file = createMockFile(1024);

      const formats = [
        { mime: 'audio/mpeg', ext: 'mp3' },
        { mime: 'audio/mp4', ext: 'm4a' },
        { mime: 'audio/wav', ext: 'wav' },
        { mime: 'audio/x-wav', ext: 'wav' },
        { mime: 'audio/ogg', ext: 'ogg' },
        { mime: 'audio/webm', ext: 'webm' },
        { mime: 'audio/aac', ext: 'aac' },
        { mime: 'audio/flac', ext: 'flac' },
      ];

      for (const format of formats) {
        const result = await service.save(file, format.mime);
        expect(result).toMatch(new RegExp(`\\.${format.ext}$`));
      }
    });
  });

  describe('mimeToExt', () => {
    it('should map all supported mime types to correct extensions', () => {
      const mockConfig = createMockConfigService();
      service = new AudioStorageService(mockConfig as any);

      // Access private method via any cast
      const mimeToExt = (service as any).mimeToExt.bind(service);

      expect(mimeToExt('audio/mpeg')).toBe('mp3');
      expect(mimeToExt('audio/mp4')).toBe('m4a');
      expect(mimeToExt('audio/wav')).toBe('wav');
      expect(mimeToExt('audio/x-wav')).toBe('wav');
      expect(mimeToExt('audio/ogg')).toBe('ogg');
      expect(mimeToExt('audio/webm')).toBe('webm');
      expect(mimeToExt('audio/aac')).toBe('aac');
      expect(mimeToExt('audio/flac')).toBe('flac');
      expect(mimeToExt('audio/unknown')).toBe('bin');
    });
  });

  describe('MAX_FILE_SIZE', () => {
    it('should enforce 10MB limit', async () => {
      const mockConfig = createMockConfigService();
      service = new AudioStorageService(mockConfig as any);

      const fileAtLimit = createMockFile(10 * 1024 * 1024); // Exactly 10MB
      const result = await service.save(fileAtLimit, 'audio/mpeg');
      expect(result).toBeDefined();

      const fileOverLimit = createMockFile(10 * 1024 * 1024 + 1);
      await expect(service.save(fileOverLimit, 'audio/mpeg')).rejects.toThrow(BadRequestException);
    });
  });
});
