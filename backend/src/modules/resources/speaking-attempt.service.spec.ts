import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpeakingService } from './speaking-attempt.service';
import { SpeakingAttempt } from './entities/speaking-attempt.entity';
import { SpeakingStatus } from '../../common/enums/resources.enums';

describe('SpeakingService', () => {
  let service: SpeakingService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakingService,
        { provide: getRepositoryToken(SpeakingAttempt), useValue: repo },
      ],
    }).compile();
    service = mod.get(SpeakingService);
    jest.clearAllMocks();
  });

  it('findAll paginates and filters', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);
    await service.findAll({ userId: 'u1', status: SpeakingStatus.SUBMITTED } as any);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', status: SpeakingStatus.SUBMITTED },
      }),
    );
  });

  it('create stamps userId and submittedAt', async () => {
    await service.create({ audioKey: 'k' } as any, 'u1');
    const arg = repo.save.mock.calls[0][0];
    expect(arg.audioKey).toBe('k');
    expect(arg.userId).toBe('u1');
    expect(arg.submittedAt).toBeInstanceOf(Date);
  });

  it('grade marks status GRADED with gradedBy', async () => {
    const entry: any = { id: 's1', status: SpeakingStatus.SUBMITTED };
    repo.findOne.mockResolvedValue(entry);
    await service.grade('s1', { score: 85 } as any, 'teacher-1');
    expect(entry.status).toBe(SpeakingStatus.GRADED);
    expect(entry.score).toBe(85);
    expect(entry.gradedBy).toBe('teacher-1');
  });
});
