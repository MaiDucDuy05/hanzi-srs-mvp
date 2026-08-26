import { Test, TestingModule } from '@nestjs/testing';
import { LessonSelectionService } from './lesson-selection.service';
import { HskLevelService } from '../curriculum/hsk-level.service';
import { TopicService } from '../curriculum/topic.service';
import { AssignmentService } from '../curriculum/assignment.service';
import { MistakeBookService } from '../resources/mistake-book.service';

describe('LessonSelectionService', () => {
  let service: LessonSelectionService;
  const hskLevelSvc = { findAll: jest.fn() };
  const topicSvc = { findAll: jest.fn() };
  const assignmentSvc = { findAll: jest.fn() };
  const mistakeBookSvc = { findAll: jest.fn() };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        LessonSelectionService,
        { provide: HskLevelService, useValue: hskLevelSvc },
        { provide: TopicService, useValue: topicSvc },
        { provide: AssignmentService, useValue: assignmentSvc },
        { provide: MistakeBookService, useValue: mistakeBookSvc },
      ],
    }).compile();
    service = mod.get(LessonSelectionService);
    jest.resetAllMocks();
    hskLevelSvc.findAll.mockResolvedValue({ data: [{ id: 'l1' }], meta: { total: 1 } });
    topicSvc.findAll.mockResolvedValue({ data: [{ id: 't1' }], meta: { total: 1 } });
    assignmentSvc.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });
    mistakeBookSvc.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });
  });

  it('getOverview for guest skips user-only fetches', async () => {
    const out = await service.getOverview();
    expect(out.hskLevels).toEqual([{ id: 'l1' }]);
    expect(out.topics).toEqual([{ id: 't1' }]);
    expect(out.assignments).toEqual([]);
    expect(out.totalMistakeCount).toBe(0);
    expect(assignmentSvc.findAll).not.toHaveBeenCalled();
    expect(mistakeBookSvc.findAll).not.toHaveBeenCalled();
  });

  it('getOverview for user pulls assignments and mistakes', async () => {
    assignmentSvc.findAll.mockResolvedValueOnce({ data: [{ id: 'a1' }], meta: { total: 1 } });
    mistakeBookSvc.findAll
      .mockResolvedValueOnce({ data: [], meta: { total: 5 } })
      .mockResolvedValueOnce({ data: [], meta: { total: 50 } });
    const out = await service.getOverview('u1');
    expect(out.assignments).toEqual([{ id: 'a1' }]);
    expect(out.recentMistakeCount).toBe(5);
    expect(out.totalMistakeCount).toBe(50);
    expect(assignmentSvc.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ assignedTo: 'u1', limit: 100 }),
    );
    expect(mistakeBookSvc.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', since: expect.any(String) }),
    );
  });

  it('getOverview passes a fresh 7-day since filter', async () => {
    const before = Date.now();
    await service.getOverview('u1');
    const since = mistakeBookSvc.findAll.mock.calls[0][0].since;
    const sinceMs = new Date(since).getTime();
    expect(sinceMs).toBeGreaterThanOrEqual(before - 7 * 86_400_000 - 100);
    expect(sinceMs).toBeLessThanOrEqual(before + 100);
  });
});
