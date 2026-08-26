import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionBankService } from './question-bank.service';
import { Question, QuestionVisibility } from './entities/question.entity';
import { Role } from '../../common/enums/user.enums';

describe('QuestionBankService', () => {
  let service: QuestionBankService;
  const repo = {
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
    findOne: jest.fn(),
    softRemove: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionBankService,
        { provide: getRepositoryToken(Question), useValue: repo },
      ],
    }).compile();
    service = mod.get(QuestionBankService);
    jest.resetAllMocks();
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation((x: any) => Promise.resolve(x));
  });

  describe('validateContent', () => {
    it('throws when content missing', async () => {
      await expect(
        service.create({ type: 'SINGLE_CHOICE', content: null } as any, 'u1', Role.ADMIN),
      ).rejects.toThrow();
    });

    it('SINGLE_CHOICE requires >=2 options and correctAnswer', async () => {
      await expect(
        service.create({ type: 'SINGLE_CHOICE', content: { options: ['a'] } } as any, 'u1', Role.ADMIN),
      ).rejects.toThrow();
      await expect(
        service.create({ type: 'SINGLE_CHOICE', content: { options: ['a', 'b'] } } as any, 'u1', Role.ADMIN),
      ).rejects.toThrow();
    });

    it('FILL_IN requires at least 1 accepted answer', async () => {
      await expect(
        service.create({ type: 'FILL_IN', content: { acceptedAnswers: [] } } as any, 'u1', Role.ADMIN),
      ).rejects.toThrow();
    });

    it('ORDERING requires >=2 items', async () => {
      await expect(
        service.create({ type: 'ORDERING', content: { correctOrder: ['x'] } } as any, 'u1', Role.ADMIN),
      ).rejects.toThrow();
    });

    it('MATCHING requires >=2 pairs', async () => {
      await expect(
        service.create({ type: 'MATCHING', content: { pairs: [] } } as any, 'u1', Role.ADMIN),
      ).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('ADMIN sets visibility to PUBLIC by default', async () => {
      await service.create(
        {
          type: 'SINGLE_CHOICE',
          content: { options: ['a', 'b'], correctAnswer: 'a' },
        } as any,
        'u1',
        Role.ADMIN,
      );
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          visibility: QuestionVisibility.PUBLIC,
          creatorId: 'u1',
        }),
      );
    });

    it('TEACHER always defaults to PRIVATE', async () => {
      await service.create(
        {
          type: 'SINGLE_CHOICE',
          content: { options: ['a', 'b'], correctAnswer: 'a' },
          visibility: QuestionVisibility.PUBLIC,
        } as any,
        't1',
        Role.TEACHER,
      );
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ visibility: QuestionVisibility.PRIVATE }),
      );
    });
  });

  describe('findAll', () => {
    it('ADMIN can filter by explicit visibility', async () => {
      const qb: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      await service.findAll({ visibility: QuestionVisibility.PRIVATE } as any, 'admin-1', Role.ADMIN);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'q.visibility = :visibility',
        { visibility: QuestionVisibility.PRIVATE },
      );
    });

    it('TEACHER without explicit visibility shows public OR own private', async () => {
      const qb: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      await service.findAll({} as any, 't1', Role.TEACHER);
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(q.visibility = :pub OR q.creatorId = :userId)',
        { pub: QuestionVisibility.PUBLIC, userId: 't1' },
      );
    });

    it('applies tags array filter and search ilike', async () => {
      const qb: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      await service.findAll(
        {
          tags: 'grammar, hsk1',
          search: '好',
          hskLevel: 1,
          difficulty: 'EASY',
          type: 'FILL_IN',
          page: 1,
          limit: 10,
        } as any,
        'admin-1',
        Role.ADMIN,
      );
      expect(qb.andWhere).toHaveBeenCalledWith('q.tags @> :tags', { tags: ['grammar', 'hsk1'] });
      expect(qb.andWhere).toHaveBeenCalledWith('q.content::text ILIKE :search', { search: '%好%' });
      expect(qb.andWhere).toHaveBeenCalledWith('q.hskLevel = :hskLevel', { hskLevel: 1 });
    });
  });

  describe('findById', () => {
    it('throws Forbidden when student accesses another user private', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 'q1',
        visibility: QuestionVisibility.PRIVATE,
        creatorId: 'other',
      });
      await expect(
        service.findById('q1', 'u2', Role.STUDENT),
      ).rejects.toThrow();
    });

    it('returns PUBLIC question without ownership check', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 'q1',
        visibility: QuestionVisibility.PUBLIC,
      });
      const q = await service.findById('q1', 'u2', Role.STUDENT);
      expect(q.id).toBe('q1');
    });
  });

  describe('update', () => {
    it('rejects non-creator teacher', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 'q1',
        visibility: QuestionVisibility.PRIVATE,
        creatorId: 'other',
      });
      await expect(
        service.update('q1', { title: 'x' } as any, 't1', Role.TEACHER),
      ).rejects.toThrow();
    });

    it('forces PRIVATE when non-admin updates', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 'q1',
        type: 'FILL_IN',
        visibility: QuestionVisibility.PUBLIC,
        creatorId: 't1',
      });
      await service.update(
        'q1',
        {
          type: 'FILL_IN',
          content: { acceptedAnswers: ['x'] },
        } as any,
        't1',
        Role.TEACHER,
      );
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ visibility: QuestionVisibility.PRIVATE }),
      );
    });
  });

  it('delete uses softRemove after ownership check', async () => {
    repo.findOne.mockResolvedValueOnce({
      id: 'q1',
      visibility: QuestionVisibility.PRIVATE,
      creatorId: 't1',
    });
    await service.delete('q1', 't1', Role.TEACHER);
    expect(repo.softRemove).toHaveBeenCalled();
  });
});
