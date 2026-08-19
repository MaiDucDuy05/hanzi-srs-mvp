import { Injectable } from '@nestjs/common';
import { HskLevelService } from '../curriculum/hsk-level.service';
import { TopicService } from '../curriculum/topic.service';
import { AssignmentService } from '../curriculum/assignment.service';
import { MistakeBookService } from '../resources/mistake-book.service';

export interface LessonSelectionOverview {
  hskLevels: Awaited<ReturnType<HskLevelService['findAll']>>['data'];
  topics: Awaited<ReturnType<TopicService['findAll']>>['data'];
  assignments: Awaited<ReturnType<AssignmentService['findAll']>>['data'];
  recentMistakeCount: number;
  totalMistakeCount: number;
}

@Injectable()
export class LessonSelectionService {
  constructor(
    private readonly hskLevelSvc: HskLevelService,
    private readonly topicSvc: TopicService,
    private readonly assignmentSvc: AssignmentService,
    private readonly mistakeBookSvc: MistakeBookService,
  ) {}

  /**
   * Trả về tổng hợp tất cả dữ liệu cho lesson-selection overview.
   * Chạy song song để tránh N+1.
   */
  async getOverview(userId?: string): Promise<LessonSelectionOverview> {
    const [hskLevels, topics, assignments, recentMistakes, totalMistakes] =
      await Promise.all([
        this.hskLevelSvc.findAll({ limit: 100 }),
        this.topicSvc.findAll({ limit: 100, status: 'PUBLISHED' }),
        userId
          ? this.assignmentSvc.findAll({ assignedTo: userId, limit: 100 })
          : Promise.resolve({ data: [], meta: { total: 0 } }),
        userId
          ? this.mistakeBookSvc.findAll({
              userId,
              since: new Date(Date.now() - 7 * 86_400_000).toISOString(),
              limit: 1,
            })
          : Promise.resolve({ data: [], meta: { total: 0 } }),
        userId
          ? this.mistakeBookSvc.findAll({ userId, limit: 1 })
          : Promise.resolve({ data: [], meta: { total: 0 } }),
      ]);

    return {
      hskLevels: hskLevels.data,
      topics: topics.data,
      assignments: assignments.data,
      recentMistakeCount: recentMistakes.meta.total,
      totalMistakeCount: totalMistakes.meta.total,
    };
  }
}
