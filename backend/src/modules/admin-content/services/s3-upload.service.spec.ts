import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { S3UploadService } from './s3-upload.service';
import { S3Client } from '@aws-sdk/client-s3';

// Mock S3Client
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
    config: { region: jest.fn().mockResolvedValue('ap-southeast-1') },
  })),
  PutObjectCommand: jest.fn().mockImplementation((x) => x),
}));

describe('S3UploadService', () => {
  let service: S3UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_S3_BUCKET_NAME') return 'test-bucket';
              if (key === 'AWS_REGION') return 'ap-southeast-1';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3UploadService>(S3UploadService);
  });

  afterEach(() => jest.clearAllMocks());

  it('uploads a file and returns the public URL', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'audio/mpeg',
      originalname: 'audio.mp3',
    } as any;

    const url = await service.uploadFile(file, 'audio');

    expect(url).toContain('https://test-bucket.s3.ap-southeast-1.amazonaws.com/audio/');
    expect(url).toContain('.mp3');
  });

  it('uses default bucket name when not configured', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => undefined),
          },
        },
      ],
    }).compile();

    const service2 = module.get<S3UploadService>(S3UploadService);
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
      originalname: 'img.png',
    } as any;

    const url = await service2.uploadFile(file, 'images');

    expect(url).toContain('hanzi-srs-bucket');
  });

  it('throws InternalServerErrorException when S3 send fails', async () => {
    (S3Client as jest.Mock).mockImplementationOnce(() => ({
      send: jest.fn().mockRejectedValue(new Error('AWS down')),
      config: { region: jest.fn().mockResolvedValue('ap-southeast-1') },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-bucket'),
          },
        },
      ],
    }).compile();

    const service2 = module.get<S3UploadService>(S3UploadService);
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'audio/mpeg',
      originalname: 'audio.mp3',
    } as any;

    await expect(service2.uploadFile(file, 'audio'))
      .rejects.toThrow(InternalServerErrorException);
  });
});