import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { YctLevel } from '../entities/yct-level.entity';
import { YctLesson } from '../entities/yct-lesson.entity';
import { YctVocabulary } from '../entities/yct-vocabulary.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { YctVocabularyQueryDto } from '../dto/yct-curriculum.dto';

@Injectable()
export class YctCurriculumService {
  constructor(
    @InjectRepository(YctLevel)
    private readonly levelRepo: Repository<YctLevel>,
    @InjectRepository(YctLesson)
    private readonly lessonRepo: Repository<YctLesson>,
    @InjectRepository(YctVocabulary)
    private readonly vocabRepo: Repository<YctVocabulary>,
  ) {}

  /** Lấy danh sách 6 cấp độ YCT công khai */
  async getLevels(): Promise<any[]> {
    const levels = await this.levelRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    // Thống kê số lượng bài học và từ vựng cho từng level
    const result = await Promise.all(
      levels.map(async (lvl) => {
        const lessonCount = await this.lessonRepo.count({
          where: {
            levelId: lvl.id,
            isActive: true,
            status: ContentStatus.PUBLISHED,
            deletedAt: IsNull(),
          },
        });

        const vocabCount = await this.vocabRepo.count({
          where: {
            levelId: lvl.id,
            isActive: true,
            status: ContentStatus.PUBLISHED,
            deletedAt: IsNull(),
          },
        });

        return {
          ...lvl,
          totalLessons: lessonCount,
          totalVocabularies: vocabCount,
        };
      }),
    );

    return result;
  }

  /** Lấy chi tiết 1 level theo code (ví dụ: 'YCT1') kèm bài học */
  async getLevelByCode(code: string): Promise<any> {
    const level = await this.levelRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!level) {
      throw new NotFoundException(`Không tìm thấy cấp độ YCT: ${code}`);
    }

    const lessons = await this.lessonRepo.find({
      where: {
        levelId: level.id,
        isActive: true,
        status: ContentStatus.PUBLISHED,
        deletedAt: IsNull(),
      },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });

    // Đếm số từ trong mỗi bài học
    const lessonsWithCounts = await Promise.all(
      lessons.map(async (l) => {
        const count = await this.vocabRepo.count({
          where: {
            lessonId: l.id,
            isActive: true,
            status: ContentStatus.PUBLISHED,
            deletedAt: IsNull(),
          },
        });
        return {
          ...l,
          vocabCount: count,
        };
      }),
    );

    return {
      ...level,
      lessons: lessonsWithCounts,
    };
  }

  /** Lấy chi tiết bài học kèm danh sách từ vựng đầy đủ để chơi Flashcard / Memory / Nối từ */
  async getLessonDetail(lessonId: string): Promise<any> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId, isActive: true, deletedAt: IsNull() },
      relations: ['level'],
    });

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học YCT`);
    }

    const vocabularies = await this.vocabRepo.find({
      where: {
        lessonId: lesson.id,
        isActive: true,
        status: ContentStatus.PUBLISHED,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });

    return {
      ...lesson,
      vocabularies: vocabularies.map((v) => this.normalizeVocabImage(v)),
    };
  }

  private normalizeVocabImage(vocab: YctVocabulary): YctVocabulary {
    if (!vocab.imageKey) return vocab;
    if (vocab.imageKey.includes('.amazonaws.com/')) {
      const key = vocab.imageKey.split('.amazonaws.com/')[1];
      vocab.imageKey = `/api/v1/resources/public/${key}`;
    } else if (vocab.imageKey.startsWith('yct-images/') || vocab.imageKey.startsWith('uploads/') || vocab.imageKey.startsWith('resources/')) {
      vocab.imageKey = `/api/v1/resources/public/${vocab.imageKey}`;
    }
    return vocab;
  }

  /** Lấy danh sách từ vựng theo bài hoặc theo level */
  async getVocabularies(query: YctVocabularyQueryDto): Promise<{ items: YctVocabulary[]; total: number }> {
    const limit = Math.min(query.limit || 50, 100);
    const page = query.page || 1;

    const qb = this.vocabRepo.createQueryBuilder('v')
      .where('v.isActive = :isActive', { isActive: true })
      .andWhere('v.deletedAt IS NULL');

    if (query.levelId) {
      qb.andWhere('v.levelId = :levelId', { levelId: query.levelId });
    }

    if (query.lessonId) {
      qb.andWhere('v.lessonId = :lessonId', { lessonId: query.lessonId });
    }

    if (query.status) {
      qb.andWhere('v.status = :status', { status: query.status });
    } else {
      qb.andWhere('v.status = :status', { status: ContentStatus.PUBLISHED });
    }

    if (query.search) {
      qb.andWhere('(v.hanzi ILIKE :s OR v.pinyin ILIKE :s OR v.meaningVi ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    qb.orderBy('v.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items: items.map((v) => this.normalizeVocabImage(v)), total };
  }
}
