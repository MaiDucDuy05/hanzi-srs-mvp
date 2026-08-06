import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import * as DTO from './dto/resources.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class ResourceService {
  constructor(@InjectRepository(Resource) private repo: Repository<Resource>) {}
  async findAll(q: DTO.ResourceQueryDto) {
    const { page = 1, limit = 20, tier, status } = q;
    const where: any = {};
    if (tier) where.tier = tier;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Resource'); }
  async create(dto: DTO.CreateResourceDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: DTO.UpdateResourceDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}
