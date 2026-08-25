import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { Resource } from './entities/resource.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { S3Service } from '../aws/s3.service';
import { ResourceTier } from '../../common/enums/resources.enums';
import { Role } from '../../common/enums/user.enums';

describe('ResourceService', () => {
  let service: ResourceService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
    softRemove: jest.fn().mockResolvedValue(undefined),
  };
  const sub = { checkVipEntitlement: jest.fn() };
  const s3 = {
    generateUploadUrl: jest.fn(),
    generateDownloadUrl: jest.fn(),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        { provide: getRepositoryToken(Resource), useValue: repo },
        { provide: SubscriptionService, useValue: sub },
        { provide: S3Service, useValue: s3 },
      ],
    }).compile();
    service = mod.get(ResourceService);
    jest.clearAllMocks();
    s3.generateDownloadUrl.mockResolvedValue('https://signed');
  });

  it('findAll hides VIP fileKey from non-entitled student', async () => {
    sub.checkVipEntitlement.mockResolvedValue(false);
    repo.findAndCount.mockResolvedValue([
      [
        { id: 'r1', tier: ResourceTier.VIP, fileKey: 'k1', hiddenByAdmin: false },
        { id: 'r2', tier: ResourceTier.FREE, fileKey: 'k2', hiddenByAdmin: false },
      ],
      2,
    ]);
    const res = await service.findAll({} as any, 'u1', Role.STUDENT);
    expect((res.data[0] as any).fileKey).toBeUndefined();
    expect((res.data[1] as any).fileKey).toBe('k2');
  });

  it('findAll reveals VIP fileKey to ADMIN role', async () => {
    repo.findAndCount.mockResolvedValue([
      [{ id: 'r1', tier: ResourceTier.VIP, fileKey: 'k1', hiddenByAdmin: false }],
      1,
    ]);
    const res = await service.findAll({} as any, undefined, Role.ADMIN);
    expect((res.data[0] as any).fileKey).toBe('k1');
  });

  it('findAll filters out hiddenByAdmin=true for non-admin/teacher', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);
    await service.findAll({} as any, 'u1', Role.STUDENT);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { hiddenByAdmin: false } }),
    );
  });

  it('findById throws ForbiddenException when hidden for student', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1', hiddenByAdmin: true });
    await expect(service.findById('r1', 'u1', Role.STUDENT)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('getDownloadUrl rejects student on VIP resource', async () => {
    sub.checkVipEntitlement.mockResolvedValue(false);
    repo.findOne.mockResolvedValue({ id: 'r1', tier: ResourceTier.VIP, fileKey: 'k1' });
    await expect(service.getDownloadUrl('r1', 'u1', Role.STUDENT)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('getDownloadUrl returns signed URL for VIP user', async () => {
    sub.checkVipEntitlement.mockResolvedValue(true);
    repo.findOne.mockResolvedValue({
      id: 'r1',
      tier: ResourceTier.VIP,
      fileKey: 'k1',
      hiddenByAdmin: false,
    });
    const out = await service.getDownloadUrl('r1', 'u1', Role.STUDENT);
    expect(out.downloadUrl).toBe('https://signed');
    expect(s3.generateDownloadUrl).toHaveBeenCalledWith('k1', 3600);
  });

  it('getUploadUrl returns S3 presigned URL with 15min ttl', async () => {
    s3.generateUploadUrl.mockResolvedValue('https://up');
    const out = await service.getUploadUrl('cover.jpg', 'image/jpeg');
    expect(out.uploadUrl).toBe('https://up');
    expect(out.key).toBe('cover.jpg');
    expect(s3.generateUploadUrl).toHaveBeenCalledWith('cover.jpg', 'image/jpeg', 900);
  });

  it('softDelete removes via softRemove', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1' });
    await service.softDelete('r1');
    expect(repo.softRemove).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('coverImageKey with S3 error sets coverImageUrl to null', async () => {
    s3.generateDownloadUrl.mockRejectedValueOnce(new Error('s3 fail'));
    repo.findOne.mockResolvedValue({ id: 'r1', coverImageKey: 'k', hiddenByAdmin: false });
    const out: any = await service.findById('r1', 'u1', Role.STUDENT);
    expect(out.coverImageUrl).toBeNull();
  });
});
