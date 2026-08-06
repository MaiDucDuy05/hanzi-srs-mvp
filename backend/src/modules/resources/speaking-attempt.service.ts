import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeakingAttempt } from './entities/speaking-attempt.entity';
import * as DTO from './dto/resources.dto';
import { SpeakingStatus } from '../../common/enums/resources.enums';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class SpeakingService {
  constructor(@InjectRepository(SpeakingAttempt) private repo: Repository<SpeakingAttempt>) {}
  async findAll(q: DTO.SpeakingAttemptQueryDto) {
    const { page = 1, limit = 20, userId, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { submittedAt: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Speaking attempt'); }
  async create(dto: DTO.CreateSpeakingAttemptDto) { return this.repo.save(this.repo.create({ ...dto, submittedAt: new Date() } as any)); }
  async grade(id: string, dto: DTO.GradeSpeakingDto, gradedBy: string) {
    const e = await this.findById(id);
    Object.assign(e, { ...dto, status: SpeakingStatus.GRADED, gradedBy });
    return this.repo.save(e);
  }
}
