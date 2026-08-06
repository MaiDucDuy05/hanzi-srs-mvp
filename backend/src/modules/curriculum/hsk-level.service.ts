import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HskLevel } from './entities/hsk-level.entity';
import { CreateHskLevelDto, UpdateHskLevelDto } from './dto/curriculum.dto';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class HskLevelService {
  constructor(@InjectRepository(HskLevel) private repo: Repository<HskLevel>) {}
  async findAll(q: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC' } = q;
    const [data, total] = await this.repo.findAndCount({ skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'HSK level'); }
  async create(dto: CreateHskLevelDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateHskLevelDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}
