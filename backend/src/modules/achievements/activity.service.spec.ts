import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { UserActivity } from './entities/user-activity.entity';
import { ActivityType } from '../../common/enums/achievements.enums';

describe('ActivityService', () => {
  let service: ActivityService;
  let mockRepo: { save: jest.Mock; create: jest.Mock };
  let mockEm: { getRepository: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      save: jest.fn().mockResolvedValue({}),
      create: jest.fn((x) => x),
    };
    mockEm = {
      getRepository: jest.fn((entity) => {
        if (entity === UserActivity) return mockRepo;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityService],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  afterEach(() => jest.clearAllMocks());

  it('writes a UserActivity row with details + expAwarded', async () => {
    await service.log(
      mockEm as any,
      'u1',
      ActivityType.PRACTICE_COMPLETED,
      { attemptId: 'a-1', score: 80 },
      10,
    );

    expect(mockRepo.create).toHaveBeenCalledWith({
      userId: 'u1',
      activityType: ActivityType.PRACTICE_COMPLETED,
      details: { attemptId: 'a-1', score: 80 },
      expAwarded: 10,
    });
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('defaults details to null and expAwarded to 0', async () => {
    await service.log(mockEm as any, 'u2', ActivityType.LOGIN);

    expect(mockRepo.create).toHaveBeenCalledWith({
      userId: 'u2',
      activityType: ActivityType.LOGIN,
      details: null,
      expAwarded: 0,
    });
  });
});