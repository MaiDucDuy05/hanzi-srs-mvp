import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Service } from './s3.service';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  const sendMock = jest.fn();
  const mockS3Client = { send: sendMock } as any;
  const presignMock = getSignedUrl as jest.Mock;

  beforeAll(() => {
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
    process.env.AWS_REGION = 'ap-southeast-1';
    (S3Client as jest.Mock).mockImplementation(() => mockS3Client);
  });

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();
    service = mod.get(S3Service);
    jest.clearAllMocks();
  });

  it('generateUploadUrl returns presigned URL from SDK', async () => {
    presignMock.mockResolvedValueOnce('https://signed-put');
    const url = await service.generateUploadUrl('docs/x.pdf', 'application/pdf', 600);
    expect(url).toBe('https://signed-put');
    expect(presignMock).toHaveBeenCalledWith(
      mockS3Client,
      expect.anything(),
      { expiresIn: 600 },
    );
  });

  it('generateUploadUrl wraps SDK errors in InternalServerErrorException', async () => {
    presignMock.mockRejectedValueOnce(new Error('boom'));
    await expect(service.generateUploadUrl('k', 'application/pdf')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('generateDownloadUrl returns presigned GET URL', async () => {
    presignMock.mockResolvedValueOnce('https://signed-get');
    const url = await service.generateDownloadUrl('docs/y.pdf', 1800);
    expect(url).toBe('https://signed-get');
    expect(presignMock).toHaveBeenCalledWith(
      mockS3Client,
      expect.anything(),
      { expiresIn: 1800 },
    );
  });

  it('generateDownloadUrl wraps SDK errors in InternalServerErrorException', async () => {
    presignMock.mockRejectedValueOnce(new Error('oops'));
    await expect(service.generateDownloadUrl('k')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
