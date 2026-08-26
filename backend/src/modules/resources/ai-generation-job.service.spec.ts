import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiJobService } from './ai-generation-job.service';
import { AiGenerationJob } from './entities/ai-generation-job.entity';
import { AiJobStatus } from '../../common/enums/resources.enums';

describe('AiJobService', () => {
  let service: AiJobService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AiJobService,
        { provide: getRepositoryToken(AiGenerationJob), useValue: repo },
      ],
    }).compile();
    service = mod.get(AiJobService);
    jest.clearAllMocks();
  });

  it('findAll returns paginated jobs', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'j1' }], 1]);
    const res = await service.findAll({ page: 1, limit: 20 } as any);
    expect(res.data).toHaveLength(1);
    expect(res.meta.total).toBe(1);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 0, take: 20 }),
    );
  });

  it('findAll filters by userId and status', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);
    await service.findAll({ userId: 'u1', status: AiJobStatus.PENDING } as any);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', status: AiJobStatus.PENDING },
      }),
    );
  });

  it('findById returns job when found', async () => {
    repo.findOne.mockResolvedValue({ id: 'j1' });
    const job = await service.findById('j1');
    expect(job.id).toBe('j1');
  });

  it('findById throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toThrow();
  });

  it('create persists with PENDING status', async () => {
    await service.create({ prompt: 'gen' } as any);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'gen', status: AiJobStatus.PENDING }),
    );
  });

  it('updateStatus sets COMPLETED with outputData and completedAt', async () => {
    repo.findOne.mockResolvedValue({ id: 'j1', status: AiJobStatus.PENDING });
    await service.updateStatus('j1', AiJobStatus.COMPLETED, { text: 'hi' });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AiJobStatus.COMPLETED,
        outputData: { text: 'hi' },
        completedAt: expect.any(Date),
      }),
    );
  });

  it('updateStatus sets FAILED with error message and completedAt', async () => {
    repo.findOne.mockResolvedValue({ id: 'j1' });
    await service.updateStatus('j1', AiJobStatus.FAILED, undefined, 'boom');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AiJobStatus.FAILED,
        error: 'boom',
        completedAt: expect.any(Date),
      }),
    );
  });

  it('updateStatus leaves completedAt undefined when transitioning to RUNNING', async () => {
    repo.findOne.mockResolvedValue({ id: 'j1' });
    await service.updateStatus('j1', AiJobStatus.RUNNING);
    const saved = repo.save.mock.calls[0][0];
    expect(saved.completedAt).toBeUndefined();
  });
});
