import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VipUpgradeService } from './vip-upgrade-request.service';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';

describe('VipUpgradeService', () => {
  let service: VipUpgradeService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        VipUpgradeService,
        { provide: getRepositoryToken(VipUpgradeRequest), useValue: repo },
      ],
    }).compile();
    service = mod.get(VipUpgradeService);
    jest.clearAllMocks();
  });

  it('findAll paginates with filters', async () => {
    repo.findAndCount.mockResolvedValueOnce([[{ id: 'v1' }], 1]);
    await service.findAll({ userId: 'u1', status: 'PENDING', page: 1, limit: 20 } as any);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1', status: 'PENDING' } }),
    );
  });

  it('findById returns request when found', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'v1' });
    const r = await service.findById('v1');
    expect(r.id).toBe('v1');
  });

  it('findById throws when missing', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findById('missing')).rejects.toThrow();
  });

  it('create persists request with requestedAt timestamp', async () => {
    await service.create({ userId: 'u1', plan: 'PRO', amount: 9.99 } as any);
    const arg = repo.save.mock.calls[0][0];
    expect(arg.userId).toBe('u1');
    expect(arg.requestedAt).toBeInstanceOf(Date);
  });

  it('review merges status, note and reviewer', async () => {
    const entry: any = { id: 'v1', status: 'PENDING', note: 'old' };
    repo.findOne.mockResolvedValueOnce(entry);
    await service.review('v1', { status: 'APPROVED', note: 'looks good' } as any, 'admin-1');
    expect(entry.status).toBe('APPROVED');
    expect(entry.note).toBe('looks good');
    expect(entry.reviewedBy).toBe('admin-1');
    expect(entry.reviewedAt).toBeInstanceOf(Date);
  });

  it('review preserves existing note when dto.note is undefined', async () => {
    const entry: any = { id: 'v1', status: 'PENDING', note: 'old note' };
    repo.findOne.mockResolvedValueOnce(entry);
    await service.review('v1', { status: 'REJECTED' } as any, 'admin-1');
    expect(entry.note).toBe('old note');
    expect(entry.status).toBe('REJECTED');
  });
});
