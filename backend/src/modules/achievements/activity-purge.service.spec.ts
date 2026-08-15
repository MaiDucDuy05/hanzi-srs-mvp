import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ActivityPurgeService } from './activity-purge.service';

describe('ActivityPurgeService', () => {
  let service: ActivityPurgeService;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn().mockResolvedValue([[], 5]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityPurgeService,
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = module.get(ActivityPurgeService);
  });

  it('purgeOldActivities — gọi DELETE với interval 90 days', async () => {
    const deleted = await service.purgeOldActivities();
    expect(dataSource.query).toHaveBeenCalledTimes(1);
    const sql = dataSource.query.mock.calls[0][0] as string;
    expect(sql).toContain('DELETE FROM user_activities');
    expect(sql).toContain("90 days'");
    expect(deleted).toBe(5);
  });

  it('KHÔNG xóa exp_transactions — query chỉ target user_activities', async () => {
    await service.purgeOldActivities();
    const sql = dataSource.query.mock.calls[0][0] as string;
    expect(sql).not.toContain('exp_transactions');
  });
});
