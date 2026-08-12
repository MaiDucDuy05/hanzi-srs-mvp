import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { MistakeBook } from './entities/mistake-book.entity';
import * as DTO from './dto/resources.dto';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

@Injectable()
export class MistakeBookService {
  constructor(
    @InjectRepository(MistakeBook) private repo: Repository<MistakeBook>,
  ) {}
  async findAll(q: DTO.MistakeBookQueryDto) {
    const { page = 1, limit = 20, userId, sourceType, sourceId, since } = q;
    const where = {} as FindOptionsWhere<MistakeBook> & { createdAt?: unknown };
    if (userId) where.userId = userId;
    if (sourceType) where.sourceType = sourceType;
    if (sourceId) where.sourceId = sourceId;
    if (since) where.createdAt = MoreThanOrEqual(new Date(since));
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) {
    return findOrNotFound(this.repo, id, 'Mistake book entry');
  }
  async create(dto: DTO.CreateMistakeBookDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async delete(id: string) {
    await this.repo.remove(await this.findById(id));
  }
}
