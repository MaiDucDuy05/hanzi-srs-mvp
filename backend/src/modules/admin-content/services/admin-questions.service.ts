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

  async bulkCreate(dtos: any[], adminId: string, ipAddress: string) {
    if (!dtos || dtos.length === 0) return [];

    const entities = dtos.map((data) =>
      this.questionRepo.create({
        ...data,
        status: data.status || ContentStatus.PUBLISHED,
        isActive: data.isActive !== undefined ? data.isActive : true,
        levelId: data.levelId || null,
        lessonId: data.lessonId || null,
        topicId: data.topicId || null,
      }) as unknown as PracticeQuestion,
    );

    const saved = await this.questionRepo.save(entities);
    const savedArray = Array.isArray(saved) ? saved : [saved];
    const firstId = savedArray[0]?.id || '00000000-0000-0000-0000-000000000000';

    await this.auditLogService.logAction(
      adminId,
      'BULK_CREATE_QUESTION',
      'QUESTION',
      firstId,
      ipAddress,
      { newValue: { count: savedArray.length } },
    );

    return savedArray;
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

  async exportCsv() {
    const questions = await this.questionRepo.find({
      where: { isActive: true },
      relations: ['level'],
      order: { createdAt: 'DESC' },
    });

    let csv = 'prompt,question_type,answer_type,choices,answer,hsk_level,translation,explanation\n';
    questions.forEach((q) => {
      const escape = (val: string | null | undefined) => `"${(val || '').replace(/"/g, '""')}"`;
      let choicesStr = '';
      let answerStr = '';

      if (q.questionType === 'FILL_BLANK') {
        const qData = q.questionData as Record<string, any> | null;
        const aData = q.answerData as Record<string, any> | null;
        if (qData?.choices && Array.isArray(qData.choices)) {
          choicesStr = qData.choices.join(';');
        }
        answerStr =
          aData?.answer ||
          (Array.isArray((q.acceptedAnswers as any)?.list)
            ? (q.acceptedAnswers as any).list[0]
            : '') ||
          '';
      } else if (q.questionType === 'SENTENCE_ORDERING') {
        const qData = q.questionData as Record<string, any> | null;
        const aData = q.answerData as Record<string, any> | null;
        if (qData?.tokens && Array.isArray(qData.tokens)) {
          const correctIds = aData?.orderedTokenIds || [];
          const orderedTexts = correctIds.map(
            (id: string) => qData.tokens.find((t: any) => t.id === id)?.text || '',
          );
          answerStr = orderedTexts.join(',');
        }
      }

      csv += `${escape(q.prompt)},${escape(q.questionType)},${escape(q.answerType || 'TEXT')},${escape(choicesStr)},${escape(answerStr)},${escape(q.level?.name || '')},${escape(q.translation)},${escape(q.explanation)}\n`;
    });

    return csv;
  }
}
