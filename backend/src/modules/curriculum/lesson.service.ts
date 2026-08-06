import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class LessonService {
  constructor(@InjectRepository(Lesson) private repo: Repository<Lesson>) {}
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
}
