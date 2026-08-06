import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import * as DTO from './dto/resources.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class VipUpgradeService {
  constructor(@InjectRepository(VipUpgradeRequest) private repo: Repository<VipUpgradeRequest>) {}
  async findAll(q: DTO.VipUpgradeRequestQueryDto) {
    const { page = 1, limit = 20, userId, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { requestedAt: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'VIP upgrade request'); }
  async create(dto: DTO.CreateVipUpgradeRequestDto) { return this.repo.save(this.repo.create({ ...dto, requestedAt: new Date() } as any)); }
  async review(id: string, dto: DTO.ReviewVipUpgradeDto, reviewedBy: string) {
    const e = await this.findById(id);
    Object.assign(e, { status: dto.status, note: dto.note ?? e.note, reviewedBy, reviewedAt: new Date() });
    return this.repo.save(e);
  }
}
