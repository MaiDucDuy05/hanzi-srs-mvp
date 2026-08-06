import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto, UpdateTopicDto, TopicQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class TopicService {
  constructor(@InjectRepository(Topic) private repo: Repository<Topic>) {}
  async findAll(q: TopicQueryDto) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC', status } = q;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Topic'); }
  async create(dto: CreateTopicDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateTopicDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}
