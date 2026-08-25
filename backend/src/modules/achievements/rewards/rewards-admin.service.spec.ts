import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RewardsAdminService } from './rewards-admin.service';
import { Reward } from '../entities/reward.entity';

describe('RewardsAdminService', () => {
  let service: RewardsAdminService;
  let repo: { find: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock; softRemove: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve(x)),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsAdminService,
        { provide: getRepositoryToken(Reward), useValue: repo },
      ],
    }).compile();

    service = module.get<RewardsAdminService>(RewardsAdminService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns all rewards ordered by costExp ASC', async () => {
      repo.find.mockResolvedValue([{ id: 'r1' }]);

      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({ order: { costExp: 'ASC' } });
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('creates a reward with defaults (active=true)', async () => {
      const dto = {
        code: 'VIP_24H',
        title: 'VIP 24h',
        type: 'TEMPORARY_VIP' as any,
        costExp: 100,
      };

      const result = await service.create(dto as any);

      expect(repo.create).toHaveBeenCalledWith({
        code: 'VIP_24H',
        title: 'VIP 24h',
        type: 'TEMPORARY_VIP',
        costExp: 100,
        metadata: {},
        active: true,
      });
      expect(repo.save).toHaveBeenCalled();
    });

    it('respects provided metadata and active flag', async () => {
      await service.create({
        code: 'x', title: 'x', type: 'COSMETIC' as any,
        costExp: 10, metadata: { foo: 1 }, active: false,
      } as any);

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
        metadata: { foo: 1 }, active: false,
      }));
    });
  });

  describe('update', () => {
    it('throws NotFoundException when reward not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('r-x', { title: 'x' } as any)).rejects.toThrow(NotFoundException);
    });

    it('updates only provided fields', async () => {
      const existing = { id: 'r1', title: 'Old', costExp: 50, type: 'COSMETIC' as any, metadata: {}, active: true };
      repo.findOne.mockResolvedValue(existing);

      await service.update('r1', { title: 'New' } as any);

      expect(existing.title).toBe('New');
      expect(existing.costExp).toBe(50);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('toggleActive', () => {
    it('flips active flag', async () => {
      repo.findOne.mockResolvedValue({ id: 'r1', active: true });

      const result = await service.toggleActive('r1');

      expect((result as any).active).toBe(false);
      expect(repo.save).toHaveBeenCalled();
    });

    it('throws when reward not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.toggleActive('r-x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft removes the reward', async () => {
      repo.findOne.mockResolvedValue({ id: 'r1' });

      const result = await service.remove('r1');

      expect(repo.softRemove).toHaveBeenCalled();
      expect(result).toEqual({ id: 'r1' });
    });

    it('throws when reward not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('r-x')).rejects.toThrow(NotFoundException);
    });
  });
});