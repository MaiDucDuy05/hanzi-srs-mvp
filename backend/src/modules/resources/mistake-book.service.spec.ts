import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MistakeBookService } from './mistake-book.service';
import { MistakeBook } from './entities/mistake-book.entity';

describe('MistakeBookService', () => {
  let service: MistakeBookService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
    remove: jest.fn().mockResolvedValue(undefined),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        MistakeBookService,
        { provide: getRepositoryToken(MistakeBook), useValue: repo },
      ],
    }).compile();
    service = mod.get(MistakeBookService);
    jest.clearAllMocks();
    repo.createQueryBuilder = jest.fn();
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation((x: any) => Promise.resolve(x));
  });

  it('findAll paginates and applies since filter as MoreThanOrEqual', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);
    await service.findAll({
      userId: 'u1',
      sourceType: 'vocab',
      sourceId: 'v1',
      since: '2026-01-01',
      page: 2,
      limit: 5,
    } as any);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
    const arg = repo.findAndCount.mock.calls[0][0];
    expect(arg.where.userId).toBe('u1');
    expect(arg.where.sourceType).toBe('vocab');
    expect(arg.where.sourceId).toBe('v1');
    expect(arg.where.createdAt).toEqual(expect.anything());
  });

  it('create persists a mistake entry', async () => {
    const dto = { userId: 'u1', sourceType: 'vocab', sourceId: 'v1', questionType: 'fill' } as any;
    await service.create(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('addToMistakeBook increments failCount when entry exists', async () => {
    const existing: any = {
      userId: 'u1',
      questionId: 'q1',
      failCount: 1,
      correctStreak: 3,
    };
    repo.findOne.mockResolvedValueOnce(existing);
    await service.addToMistakeBook('u1', 'practice', 'p1', 'fill', { q: 1 }, 'a', 'b', 'q1');
    expect(existing.failCount).toBe(2);
    expect(existing.correctStreak).toBe(0);
    expect(existing.lastFailedAt).toBeInstanceOf(Date);
    expect(existing.sourceId).toBe('p1');
    expect(repo.save).toHaveBeenCalledWith(existing);
  });

  it('addToMistakeBook removes oldest entry when user hits 500 limit', async () => {
    repo.count.mockResolvedValueOnce(500);
    const oldest: any = { id: 'oldest' };
    repo.findOne.mockResolvedValueOnce(oldest);
    await service.addToMistakeBook('u1', 'practice', 'p1', 'fill', { q: 1 });
    expect(repo.remove).toHaveBeenCalledWith(oldest);
  });

  it('addToMistakeBook creates fresh entry when none exists', async () => {
    repo.count.mockResolvedValueOnce(10);
    await service.addToMistakeBook('u1', 'practice', 'p1', 'fill', { q: 1 });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1' }),
    );
  });

  it('startReview returns up to 10 prioritized questions and updates lastReviewedAt', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]),
    };
    const updateQb: any = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      whereInIds: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    repo.createQueryBuilder
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(updateQb);
    const out = await service.startReview('u1');
    expect(out).toHaveLength(2);
    expect(updateQb.execute).toHaveBeenCalled();
  });

  it('startReview with filter=recent applies lastFailedAt AND clause', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    repo.createQueryBuilder.mockReturnValueOnce(qb);
    await service.startReview('u1', 'recent');
    expect(qb.andWhere).toHaveBeenCalledWith(
      'mb.lastFailedAt >= :sevenDaysAgo',
      expect.objectContaining({ sevenDaysAgo: expect.any(Date) }),
    );
  });

  it('submitReview removes entry when answer is correct', async () => {
    const entry: any = { id: 'm1', userId: 'u1', failCount: 2 };
    repo.findOne.mockResolvedValue(entry);
    const out = await service.submitReview('m1', 'u1', true);
    expect(repo.remove).toHaveBeenCalledWith(entry);
    expect(out.message).toMatch(/removed/i);
  });

  it('submitReview increments failCount when answer is wrong', async () => {
    const entry: any = { id: 'm1', userId: 'u1', failCount: 2 };
    repo.findOne.mockResolvedValue(entry);
    const out = await service.submitReview('m1', 'u1', false);
    expect(entry.failCount).toBe(3);
    expect(out.message).toMatch(/updated/i);
  });

  it('submitReview rejects when entry belongs to another user', async () => {
    const entry: any = { id: 'm1', userId: 'other' };
    repo.findOne.mockResolvedValue(entry);
    await expect(service.submitReview('m1', 'u1', true)).rejects.toThrow(/Not authorized/);
  });
});
