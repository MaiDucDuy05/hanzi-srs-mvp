import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiGenerationJob } from './entities/ai-generation-job.entity';
import * as DTO from './dto/resources.dto';
import { AiJobStatus } from '../../common/enums/resources.enums';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class AiJobService {
  constructor(@InjectRepository(AiGenerationJob) private repo: Repository<AiGenerationJob>) {}
  async findAll(q: DTO.AiJobQueryDto) {
    const { page = 1, limit = 20, userId, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'AI job'); }
  async create(dto: DTO.CreateAiJobDto) { return this.repo.save(this.repo.create({ ...dto, status: AiJobStatus.PENDING } as any)); }
  async updateStatus(id: string, status: AiJobStatus, outputData?: any, error?: string) {
    const job = await this.findById(id);
    Object.assign(job, { status, ...(outputData ? { outputData } : {}), ...(error ? { error } : {}), ...(status === AiJobStatus.COMPLETED || status === AiJobStatus.FAILED ? { completedAt: new Date() } : {}) });
    return this.repo.save(job);
  }
}
