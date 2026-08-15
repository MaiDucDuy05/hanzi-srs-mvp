import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeQuestion } from '../../practice/entities/practice-question.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

@Injectable()
export class AdminQuestionsService {
  constructor(
    @InjectRepository(PracticeQuestion) private readonly questionRepo: Repository<PracticeQuestion>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    
    const qb = this.questionRepo.createQueryBuilder('question')
      .where('question.isActive = :isActive', { isActive: true })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('question.createdAt', 'DESC');

    if (query.status) qb.andWhere('question.status = :status', { status: query.status });
    if (query.search) qb.andWhere('question.prompt ILIKE :search', { search: `%${query.search}%` });
    if (query.levelId) qb.andWhere('question.levelId = :levelId', { levelId: query.levelId });

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async create(data: any, adminId: string, ipAddress: string) {
    const newQuestion = this.questionRepo.create({
      ...data,
      status: data.status || ContentStatus.DRAFT,
    }) as unknown as PracticeQuestion;
    
    await this.questionRepo.save(newQuestion);
    await this.auditLogService.logAction(adminId, 'CREATE_QUESTION', 'QUESTION', newQuestion.id, ipAddress, { newValue: data });
    return newQuestion;
  }

  async update(id: string, data: any, adminId: string, ipAddress: string) {
    const question = await this.questionRepo.findOne({ where: { id, isActive: true } });
    if (!question) throw new NotFoundException('Question not found');

    const oldValue = { ...question };
    Object.assign(question, data);
    await this.questionRepo.save(question);

    await this.auditLogService.logAction(adminId, 'UPDATE_QUESTION', 'QUESTION', question.id, ipAddress, { oldValue, newValue: data });
    return question;
  }

  async softDelete(id: string, adminId: string, ipAddress: string) {
    const question = await this.questionRepo.findOne({ where: { id, isActive: true } });
    if (!question) throw new NotFoundException('Question not found');

    // Soft delete
    question.isActive = false;
    question.deletedAt = new Date();
    await this.questionRepo.save(question);

    await this.auditLogService.logAction(adminId, 'DELETE_QUESTION', 'QUESTION', question.id, ipAddress, {});
    return { success: true };
  }
}
