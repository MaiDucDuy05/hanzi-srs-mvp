import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HskLevel } from './entities/hsk-level.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { GrammarPoint } from './entities/grammar-point.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonContent } from './entities/lesson-content.entity';
import { Topic } from './entities/topic.entity';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';
import {
  CreateHskLevelDto, UpdateHskLevelDto,
  CreateVocabularyDto, UpdateVocabularyDto,
  CreateGrammarPointDto, UpdateGrammarPointDto,
  CreateLessonDto, UpdateLessonDto,
  CreateLessonContentDto, UpdateLessonContentDto,
  CreateTopicDto, UpdateTopicDto,
  CreateTopicVocabularyDto, UpdateTopicVocabularyDto,
} from './dto/curriculum.dto';
import { PaginationQueryDto, PaginatedResult } from '../../common/pagination.dto';

function paginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function findOrThrow<T extends { id: string }>(repo: Repository<T>, id: string, label: string): Promise<T> {
  const e = await repo.findOne({ where: { id } as any });
  if (!e) throw new NotFoundException(`${label} not found`);
  return e;
}

// ---- HskLevel ----
@Injectable()
export class HskLevelService {
  constructor(@InjectRepository(HskLevel) private repo: Repository<HskLevel>) {}
  async findAll(q: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC' } = q;
    const [data, total] = await this.repo.findAndCount({ skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'HSK level'); }
  async create(dto: CreateHskLevelDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateHskLevelDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}

// ---- Vocabulary ----
@Injectable()
export class VocabularyService {
  constructor(@InjectRepository(Vocabulary) private repo: Repository<Vocabulary>) {}
  async findAll(q: PaginationQueryDto & { levelId?: string; status?: string }) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = q as any;
    const where: any = {};
    if ((q as any).levelId) where.levelId = (q as any).levelId;
    if ((q as any).status) where.status = (q as any).status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'Vocabulary'); }
  async create(dto: CreateVocabularyDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateVocabularyDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

// ---- GrammarPoint ----
@Injectable()
export class GrammarPointService {
  constructor(@InjectRepository(GrammarPoint) private repo: Repository<GrammarPoint>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', levelId, status } = q;
    const where: any = {};
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'Grammar point'); }
  async create(dto: CreateGrammarPointDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateGrammarPointDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

// ---- Lesson ----
@Injectable()
export class LessonService {
  constructor(@InjectRepository(Lesson) private repo: Repository<Lesson>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC', levelId, status } = q;
    const where: any = {};
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'Lesson'); }
  async create(dto: CreateLessonDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateLessonDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

// ---- LessonContent ----
@Injectable()
export class LessonContentService {
  constructor(@InjectRepository(LessonContent) private repo: Repository<LessonContent>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, lessonId } = q;
    const where: any = {};
    if (lessonId) where.lessonId = lessonId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'Lesson content'); }
  async create(dto: CreateLessonContentDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateLessonContentDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}

// ---- Topic ----
@Injectable()
export class TopicService {
  constructor(@InjectRepository(Topic) private repo: Repository<Topic>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC', status } = q;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'Topic'); }
  async create(dto: CreateTopicDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateTopicDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

// ---- TopicVocabulary ----
@Injectable()
export class TopicVocabularyService {
  constructor(@InjectRepository(TopicVocabulary) private repo: Repository<TopicVocabulary>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, topicId } = q;
    const where: any = {};
    if (topicId) where.topicId = topicId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrThrow(this.repo, id, 'Topic vocabulary'); }
  async create(dto: CreateTopicVocabularyDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateTopicVocabularyDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}
