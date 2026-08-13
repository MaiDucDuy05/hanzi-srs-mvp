import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { Vocabulary } from './entities/vocabulary.entity';
import { ContentStatus } from '../../common/enums/curriculum.enums';

describe('VocabularyService', () => {
  let service: VocabularyService;
  let repo: jest.Mocked<Repository<Vocabulary>>;
  let mockQb: ReturnType<typeof createMockQb>;

  function createMockQb() {
    return {
      innerJoin: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockVocabulary], 1]),
    };
  }

  const mockVocabulary: Vocabulary = {
    id: 'vocab-1',
    levelId: 'level-1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    meaningVi: 'xin chào',
    audioKey: '/audio/nihao.mp3',
    partOfSpeech: null,
    example: null,
    status: ContentStatus.PUBLISHED,
    topicVocabularies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockQb = createMockQb();
    const mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyService,
        { provide: getRepositoryToken(Vocabulary), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<VocabularyService>(VocabularyService);
    repo = module.get(getRepositoryToken(Vocabulary));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated vocabulary with default options', async () => {
      const result = await service.findAll({});
      expect(result.data).toEqual([mockVocabulary]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by levelId', async () => {
      await service.findAll({ levelId: 'level-1' });
      expect(repo.createQueryBuilder).toHaveBeenCalledWith('v');
    });

    it('should filter by status', async () => {
      await service.findAll({ status: ContentStatus.PUBLISHED });
      expect(repo.createQueryBuilder).toHaveBeenCalledWith('v');
    });

    it('should sort by createdAt DESC by default', async () => {
      await service.findAll({});
      expect(mockQb.orderBy).toHaveBeenCalled();
    });

    it('should handle custom sort parameters', async () => {
      await service.findAll({ sortBy: 'hanzi', sortOrder: 'ASC' });
      expect(mockQb.orderBy).toHaveBeenCalledWith('v.hanzi', 'ASC');
    });

    it('should calculate correct pagination', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 100]);
      const result = await service.findAll({ page: 3, limit: 10 });
      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(10);
      expect(mockQb.skip).toHaveBeenCalledWith(20));
      expect(mockQb.take).toHaveBeenCalledWith(10));
    });

    it('should filter by topicId using innerJoin', async () => {
      await service.findAll({ topicId: 'topic-1' });
      expect(mockQb.innerJoin).toHaveBeenCalled();
      expect(mockQb.orderBy).toHaveBeenCalledWith('tv.displayOrder', 'ASC');
    });
  });

  describe('findById', () => {
    it('should return vocabulary when found', async () => {
      repo.findOne.mockResolvedValue(mockVocabulary);
      const result = await service.findById('vocab-1');
      expect(result).toEqual(mockVocabulary);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'vocab-1' } });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      levelId: 'level-1',
      hanzi: '谢谢',
      pinyin: 'xiè xiè',
      meaningVi: 'cảm ơn',
    };

    it('should create and return new vocabulary', async () => {
      const created = { ...mockVocabulary, ...createDto };
      repo.create.mockReturnValue(created as Vocabulary);
      repo.save.mockResolvedValue(created as Vocabulary);
      const result = await service.create(createDto);
      expect(repo.create).toHaveBeenCalledWith(createDto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.hanzi).toBe(createDto.hanzi);
    });
  });

  describe('update', () => {
    it('should update vocabulary fields', async () => {
      const updateDto = { meaningVi: 'chào bạn', pinyin: 'nǐ hǎo!' };
      const updated = { ...mockVocabulary, ...updateDto };
      repo.findOne.mockResolvedValue(mockVocabulary);
      repo.save.mockResolvedValue(updated as Vocabulary);
      const result = await service.update('vocab-1', updateDto);
      expect(result.meaningVi).toBe(updateDto.meaningVi);
    });

    it('should throw NotFoundException when updating non-existent vocabulary', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update('non-existent', { meaningVi: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete vocabulary', async () => {
      repo.findOne.mockResolvedValue(mockVocabulary);
      repo.softRemove.mockResolvedValue(mockVocabulary);
      await service.softDelete('vocab-1');
      expect(repo.softRemove).toHaveBeenCalledWith(mockVocabulary);
    });

    it('should throw NotFoundException when deleting non-existent vocabulary', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.softDelete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
