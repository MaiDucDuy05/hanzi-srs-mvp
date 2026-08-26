import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../../curriculum/entities/lesson.entity';
import { LessonContent } from '../../curriculum/entities/lesson-content.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

@Injectable()
export class AdminLessonsService {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonContent) private readonly lessonContentRepo: Repository<LessonContent>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAllByCourse(courseId: string, query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    
    const qb = this.lessonRepo.createQueryBuilder('lesson')
      .where('lesson.levelId = :courseId', { courseId }) // levelId relates to HskLevel (Course)
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('lesson.displayOrder', 'ASC')
      .addOrderBy('lesson.createdAt', 'DESC');

    if (query.status) qb.andWhere('lesson.status = :status', { status: query.status });
    if (query.search) qb.andWhere('lesson.title ILIKE :search', { search: `%${query.search}%` });

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 1000;
    const page = parseInt(query.page) || 1;
    
    const qb = this.lessonRepo.createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.level', 'course')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('course.displayOrder', 'ASC') 
      .addOrderBy('lesson.displayOrder', 'ASC')
      .addOrderBy('lesson.createdAt', 'DESC');

    if (query.status) qb.andWhere('lesson.status = :status', { status: query.status });
    if (query.search) qb.andWhere('lesson.title ILIKE :search', { search: `%${query.search}%` });

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async create(courseId: string, data: any, adminId: string, ipAddress: string) {
    const newLesson = this.lessonRepo.create({
      ...data,
      levelId: courseId,
      status: data.status || ContentStatus.DRAFT,
    }) as unknown as Lesson;
    
    await this.lessonRepo.save(newLesson);

    await this.auditLogService.logAction(adminId, 'CREATE_LESSON', 'LESSON', newLesson.id, ipAddress, { newValue: data });
    return newLesson;
  }

  async update(id: string, data: any, adminId: string, ipAddress: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const oldValue = { ...lesson };
    Object.assign(lesson, data);
    await this.lessonRepo.save(lesson);

    await this.auditLogService.logAction(adminId, 'UPDATE_LESSON', 'LESSON', lesson.id, ipAddress, { oldValue, newValue: data });
    return lesson;
  }

  async reorder(items: { id: string; order: number }[], adminId: string, ipAddress: string) {
    for (const item of items) {
      await this.lessonRepo.update({ id: item.id }, { displayOrder: item.order });
    }
    await this.auditLogService.logAction(adminId, 'REORDER_LESSONS', 'LESSON', 'multiple', ipAddress, { newValue: items });
    return true;
  }

  async changeStatus(id: string, status: string, adminId: string, ipAddress: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const oldStatus = lesson.status;
    lesson.status = status as ContentStatus;
    if (status === ContentStatus.PUBLISHED && !lesson.publishedAt) {
        lesson.publishedAt = new Date();
    }
    await this.lessonRepo.save(lesson);

    await this.auditLogService.logAction(adminId, 'CHANGE_LESSON_STATUS', 'LESSON', lesson.id, ipAddress, { oldValue: { status: oldStatus }, newValue: { status } });
    return lesson;
  }
  
   async getLessonContents(query: any) {
    const limit = parseInt(query.limit) || 100;
    const page = parseInt(query.page) || 1;
    const { lessonId } = query;
    const where: any = {};
    if (lessonId) where.lessonId = lessonId;

    const [data, total] = await this.lessonContentRepo.findAndCount({
      where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' }
    });

    for (const item of data) {
      if (item.contentType === 'VOCABULARY') {
        const vocab = await this.lessonContentRepo.manager.query(`SELECT id, hanzi, pinyin, meaning_vi FROM vocabularies WHERE id = $1`, [item.contentId]);
        if (vocab[0]) (item as any).vocabulary = vocab[0];
      } else if (item.contentType === 'GRAMMAR') {
        const grammar = await this.lessonContentRepo.manager.query(`SELECT id, title, structure FROM grammar_points WHERE id = $1`, [item.contentId]);
        if (grammar[0]) (item as any).grammar = grammar[0];
      }
    }
    return { items: data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }


  async addLessonContent(data: Partial<LessonContent>, adminId: string, ipAddress: string) {
    const existing = await this.lessonContentRepo.findOne({
      where: { lessonId: data.lessonId, contentType: data.contentType, contentId: data.contentId }
    });
    if (existing) return existing;
    const item = this.lessonContentRepo.create(data);
    await this.lessonContentRepo.save(item);
    await this.auditLogService.logAction(adminId, 'CREATE_LESSON_CONTENT', 'LESSON_CONTENT', item.lessonId, ipAddress, { newValue: data });
    return item;
  }

  async removeLessonContent(id: string, adminId: string, ipAddress: string) {
    const item = await this.lessonContentRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Lesson content not found');
    await this.lessonContentRepo.remove(item);
    await this.auditLogService.logAction(adminId, 'DELETE_LESSON_CONTENT', 'LESSON_CONTENT', id, ipAddress, { oldValue: item });
    return { success: true };
  }
}
