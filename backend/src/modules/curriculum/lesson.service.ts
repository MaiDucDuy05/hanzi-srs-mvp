import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonContent } from './entities/lesson-content.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { GrammarPoint } from './entities/grammar-point.entity';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';
import { ContentType } from '../../common/enums/curriculum.enums';

export interface LessonContentsAggregate {
  vocabularies: Vocabulary[];
  grammarPoints: GrammarPoint[];
}

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson) private repo: Repository<Lesson>,
    @InjectRepository(LessonContent) private contentRepo: Repository<LessonContent>,
    @InjectRepository(Vocabulary) private vocabRepo: Repository<Vocabulary>,
    @InjectRepository(GrammarPoint) private grammarRepo: Repository<GrammarPoint>,
  ) {}
  async findAll(q: LessonQueryDto) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC', levelId, status } = q;
    const where: any = {};
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Lesson'); }
  async create(dto: CreateLessonDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateLessonDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }

  /**
   * Tổng hợp nội dung bài học — join qua lesson_contents trả vocab + grammar
   * trong 1 request thay vì N+1.
   */
  async getContents(lessonId: string): Promise<LessonContentsAggregate> {
    // Verify lesson exists
    await this.findById(lessonId);

    const contents = await this.contentRepo.find({
      where: { lessonId },
      order: { displayOrder: 'ASC' },
    });

    const vocabIds = contents
      .filter((c) => c.contentType === ContentType.VOCABULARY)
      .map((c) => c.contentId);
    const grammarIds = contents
      .filter((c) => c.contentType === ContentType.GRAMMAR)
      .map((c) => c.contentId);

    const [vocabularies, grammarPoints] = await Promise.all([
      vocabIds.length > 0
        ? this.vocabRepo.find({ where: { id: In(vocabIds) } })
        : Promise.resolve([]),
      grammarIds.length > 0
        ? this.grammarRepo.find({ where: { id: In(grammarIds) } })
        : Promise.resolve([]),
    ]);

    return { vocabularies, grammarPoints };
  }
}
