import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssignmentService } from './assignment.service';
import { Assignment } from './entities/assignment.entity';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let repo: { findAndCount: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    repo = { findAndCount: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        { provide: getRepositoryToken(Assignment), useValue: repo },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated assignments', async () => {
      repo.findAndCount.mockResolvedValue([[{ id: 'a-1' }], 1]);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
    });

    it('filters by assignedTo', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ assignedTo: 'u-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ assignedTo: 'u-1' }) }),
      );
    });

    it('filters by assignedBy', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ assignedBy: 'teacher-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ assignedBy: 'teacher-1' }) }),
      );
    });

    it('filters by status', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: 'COMPLETED' as any });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) }),
      );
    });
  });

  describe('findById', () => {
    it('returns assignment when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'a-1' });

      const result = await service.findById('a-1');
      expect(result).toEqual({ id: 'a-1' });
    });

    it('throws when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow();
    });
  });
});