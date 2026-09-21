import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceType } from './entities/resource-type.entity';
import {
  CreateResourceTypeDto,
  UpdateResourceTypeDto,
} from './dto/resource-type.dto';

@Injectable()
export class ResourceTypeService {
  constructor(
    @InjectRepository(ResourceType)
    private readonly repo: Repository<ResourceType>,
  ) {}

  async findAll(includeInactive = false): Promise<ResourceType[]> {
    const qb = this.repo.createQueryBuilder('rt')
      .loadRelationCountAndMap(
        'rt.resourceCount', 
        'rt.resources', 
        'res', 
        (qb) => qb.where("res.deleted_at IS NULL") // optionally we could filter by status = 'PUBLISHED'
      );

    if (!includeInactive) {
      qb.andWhere('rt.isActive = :isActive', { isActive: true });
    }

    qb.orderBy('rt.displayOrder', 'ASC')
      .addOrderBy('rt.name', 'ASC');

    return qb.getMany();
  }

  async findById(id: string): Promise<ResourceType> {
    const type = await this.repo.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException(`Resource type with id ${id} not found`);
    }
    return type;
  }

  async create(dto: CreateResourceTypeDto): Promise<ResourceType> {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Resource type with code '${dto.code}' already exists`);
    }
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateResourceTypeDto): Promise<ResourceType> {
    const entity = await this.findById(id);
    if (dto.code && dto.code !== entity.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Resource type with code '${dto.code}' already exists`);
      }
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async softDelete(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.repo.softRemove(entity);
  }
}
