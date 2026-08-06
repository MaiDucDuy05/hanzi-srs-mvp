import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarPoint } from './entities/grammar-point.entity';
import { CreateGrammarPointDto, UpdateGrammarPointDto, GrammarPointQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class GrammarPointService {
  constructor(@InjectRepository(GrammarPoint) private repo: Repository<GrammarPoint>) {}
  async findAll(q: GrammarPointQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', levelId, status } = q;
    const where: any = {};
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Grammar point'); }
  async create(dto: CreateGrammarPointDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateGrammarPointDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}
