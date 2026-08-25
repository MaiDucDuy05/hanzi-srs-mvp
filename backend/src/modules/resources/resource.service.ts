import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import * as DTO from './dto/resources.dto';
import { ResourceTier } from '../../common/enums/resources.enums';
import { Role } from '../../common/enums/user.enums';
import { SubscriptionService } from '../subscription/subscription.service';
import { S3Service } from '../aws/s3.service';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource) private repo: Repository<Resource>,
    private readonly subscriptionSvc: SubscriptionService,
    private readonly s3Svc: S3Service,
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
  ): Promise<any | any[]> {
    const isEntitled =
      role === Role.TEACHER ||
      role === Role.ADMIN ||
      (!!userId && (await this.subscriptionSvc.checkVipEntitlement(userId)));
      
    const mask = async (r: Resource): Promise<any> => {
      const copy = { ...r } as any;
      
      // Che giấu fileKey nếu là VIP và user chưa có quyền
      if (!isEntitled && r.tier === ResourceTier.VIP) {
        delete copy.fileKey;
      }
      
      // Tạo URL ảnh bìa public (nếu có)
      if (r.coverImageKey) {
        try {
          copy.coverImageUrl = await this.s3Svc.generateDownloadUrl(r.coverImageKey, 3600);
        } catch (e) {
          copy.coverImageUrl = null;
        }
      }
      
      return copy;
    };
    
    return Array.isArray(resources) 
      ? Promise.all(resources.map(mask)) 
      : mask(resources);
  }

  async findAll(q: DTO.ResourceQueryDto, userId?: string, role?: string) {
    const { page = 1, limit = 20, tier, status } = q;
    const where: any = {};
    if (tier) where.tier = tier;
    if (status) where.status = status;
    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      where.hiddenByAdmin = false;
    }
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
    if (role !== Role.ADMIN && role !== Role.TEACHER && resource.hiddenByAdmin) {
      throw new ForbiddenException('This resource has been hidden by administrator');
    }
    return this.maskFileKey(resource, userId, role);
  }

  async create(dto: DTO.CreateResourceDto) {
    const r = await this.repo.save(this.repo.create(dto as any));
    return this.maskFileKey(r, undefined, Role.ADMIN);
  }

  async update(id: string, dto: DTO.UpdateResourceDto) {
    const e = await findOrNotFound(this.repo, id, 'Resource');
    Object.assign(e, dto);
    const r = await this.repo.save(e);
    return this.maskFileKey(r, undefined, Role.ADMIN);
  }

  async softDelete(id: string) {
    await this.repo.softRemove(await findOrNotFound(this.repo, id, 'Resource'));
  }

  async getUploadUrl(key: string, contentType: string) {
    // Generate an S3 upload URL valid for 15 minutes
    const url = await this.s3Svc.generateUploadUrl(key, contentType, 900);
    return { uploadUrl: url, key };
  }

  async getPublicDownloadUrl(key: string) {
    return this.s3Svc.generateDownloadUrl(key, 3600);
  }

  async getDownloadUrl(id: string, userId?: string, role?: string) {
    // We reuse findById to check if the user is allowed to access this resource
    // maskFileKey will remove fileKey if they are not VIP!
    const resource = await this.findById(id, userId, role) as Resource;
    
    if (!resource.fileKey) {
      throw new ForbiddenException('You must be a VIP member to download this resource');
    }

    // Generate an S3 download URL valid for 1 hour
    const url = await this.s3Svc.generateDownloadUrl(resource.fileKey, 3600);
    return { downloadUrl: url, resource };
  }
}
