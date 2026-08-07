import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import * as DTO from './dto/resources.dto';
import { ResourceTier } from '../../common/enums/resources.enums';
import { Role } from '../../common/enums/user.enums';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource) private repo: Repository<Resource>,
    private readonly subscriptionSvc: SubscriptionService,
  ) {}

  /**
   * VIP gating phía server (BRD): tài nguyên VIP chỉ trả `fileKey` cho người
   * được phép (VIP còn hạn / Teacher / Admin). Người khác vẫn xem metadata
   * (mô tả, tier) nhưng không có đường tải file — chống bypass bằng DevTools.
   */
  private async maskFileKey(
    resources: Resource | Resource[],
    userId: string | undefined,
    role: string | undefined,
  ): Promise<Resource | Resource[]> {
    const isEntitled =
      role === Role.TEACHER ||
      role === Role.ADMIN ||
      (!!userId && (await this.subscriptionSvc.checkVipEntitlement(userId)));
    if (isEntitled) return resources;
    const mask = (r: Resource): Resource => {
      if (r.tier !== ResourceTier.VIP) return r;
      const copy = { ...r };
      delete (copy as Partial<Resource>).fileKey;
      return copy as Resource;
    };
    return Array.isArray(resources) ? resources.map(mask) : mask(resources);
  }

  async findAll(q: DTO.ResourceQueryDto, userId?: string, role?: string) {
    const { page = 1, limit = 20, tier, status } = q;
    const where: any = {};
    if (tier) where.tier = tier;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const masked = (await this.maskFileKey(
      data,
      userId,
      role,
    )) as Resource[];
    return paginatedResult(masked, total, page, limit);
  }

  async findById(id: string, userId?: string, role?: string) {
    const resource = await findOrNotFound(this.repo, id, 'Resource');
    return this.maskFileKey(resource, userId, role);
  }

  async create(dto: DTO.CreateResourceDto) {
    return this.repo.save(this.repo.create(dto as any));
  }

  async update(id: string, dto: DTO.UpdateResourceDto) {
    const e = await findOrNotFound(this.repo, id, 'Resource');
    Object.assign(e, dto);
    return this.repo.save(e);
  }

  async softDelete(id: string) {
    await this.repo.softRemove(await findOrNotFound(this.repo, id, 'Resource'));
  }
}
