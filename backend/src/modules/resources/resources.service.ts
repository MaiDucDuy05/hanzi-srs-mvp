import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { AiGenerationJob } from './entities/ai-generation-job.entity';
import { ContactRequest } from './entities/contact-request.entity';
import { MistakeBook } from './entities/mistake-book.entity';
import { SpeakingAttempt } from './entities/speaking-attempt.entity';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import * as DTO from './dto/resources.dto';
import { AiJobStatus, UpgradeRequestStatus, SpeakingStatus, ContactStatus } from '../../common/enums/resources.enums';
import { PaginatedResult } from '../../common/pagination.dto';

function paginated<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function findOr404<T extends { id: string }>(repo: Repository<T>, id: string, label: string): Promise<T> {
  const e = await repo.findOne({ where: { id } as any });
  if (!e) throw new NotFoundException(`${label} not found`);
  return e;
}

// ---- Resource ----
@Injectable()
export class ResourceService {
  constructor(@InjectRepository(Resource) private repo: Repository<Resource>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, tier, status } = q;
    const where: any = {};
    if (tier) where.tier = tier;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Resource'); }
  async create(dto: DTO.CreateResourceDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: DTO.UpdateResourceDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

// ---- AiGenerationJob ----
@Injectable()
export class AiJobService {
  constructor(@InjectRepository(AiGenerationJob) private repo: Repository<AiGenerationJob>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, userId, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'AI job'); }
  async create(dto: DTO.CreateAiJobDto) { return this.repo.save(this.repo.create({ ...dto, status: AiJobStatus.PENDING } as any)); }
  async updateStatus(id: string, status: AiJobStatus, outputData?: any, error?: string) {
    const job = await this.findById(id);
    Object.assign(job, { status, ...(outputData ? { outputData } : {}), ...(error ? { error } : {}), ...(status === AiJobStatus.COMPLETED || status === AiJobStatus.FAILED ? { completedAt: new Date() } : {}) });
    return this.repo.save(job);
  }
}

// ---- ContactRequest ----
@Injectable()
export class ContactService {
  constructor(@InjectRepository(ContactRequest) private repo: Repository<ContactRequest>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, status } = q;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Contact request'); }
  async create(dto: DTO.CreateContactRequestDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: DTO.UpdateContactRequestDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
}

// ---- MistakeBook ----
@Injectable()
export class MistakeBookService {
  constructor(@InjectRepository(MistakeBook) private repo: Repository<MistakeBook>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, userId, sourceType, sourceId } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (sourceType) where.sourceType = sourceType;
    if (sourceId) where.sourceId = sourceId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Mistake book entry'); }
  async create(dto: DTO.CreateMistakeBookDto) { return this.repo.save(this.repo.create(dto as any)); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}

// ---- SpeakingAttempt ----
@Injectable()
export class SpeakingService {
  constructor(@InjectRepository(SpeakingAttempt) private repo: Repository<SpeakingAttempt>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, userId, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { submittedAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Speaking attempt'); }
  async create(dto: DTO.CreateSpeakingAttemptDto) { return this.repo.save(this.repo.create({ ...dto, submittedAt: new Date() } as any)); }
  async grade(id: string, dto: DTO.GradeSpeakingDto, gradedBy: string) {
    const e = await this.findById(id);
    Object.assign(e, { ...dto, status: SpeakingStatus.GRADED, gradedBy });
    return this.repo.save(e);
  }
}

// ---- VipUpgradeRequest ----
@Injectable()
export class VipUpgradeService {
  constructor(@InjectRepository(VipUpgradeRequest) private repo: Repository<VipUpgradeRequest>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, userId, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { requestedAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'VIP upgrade request'); }
  async create(dto: DTO.CreateVipUpgradeRequestDto) { return this.repo.save(this.repo.create({ ...dto, requestedAt: new Date() } as any)); }
  async review(id: string, dto: DTO.ReviewVipUpgradeDto, reviewedBy: string) {
    const e = await this.findById(id);
    Object.assign(e, { status: dto.status, note: dto.note ?? e.note, reviewedBy, reviewedAt: new Date() });
    return this.repo.save(e);
  }
}
