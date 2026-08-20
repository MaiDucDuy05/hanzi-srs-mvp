import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../../curriculum/entities/lesson.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

@Injectable()
export class AdminLessonsService {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
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
}
