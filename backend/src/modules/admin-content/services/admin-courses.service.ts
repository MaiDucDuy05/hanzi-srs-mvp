import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HskLevel } from '../../curriculum/entities/hsk-level.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

@Injectable()
export class AdminCoursesService {
  constructor(
    @InjectRepository(HskLevel) private readonly courseRepo: Repository<HskLevel>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    
    const qb = this.courseRepo.createQueryBuilder('course')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('course.displayOrder', 'ASC')
      .addOrderBy('course.createdAt', 'DESC');

    if (query.status) qb.andWhere('course.status = :status', { status: query.status });
    if (query.search) qb.andWhere('course.name ILIKE :search', { search: `%${query.search}%` });

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async create(data: any, adminId: string, ipAddress: string) {
    const newCourse = this.courseRepo.create({
      code: data.code,
      name: data.name,
      displayOrder: data.displayOrder || 0,
      status: data.status || ContentStatus.DRAFT,
    });
    
    await this.courseRepo.save(newCourse);

    await this.auditLogService.logAction(adminId, 'CREATE_COURSE', 'COURSE', newCourse.id, ipAddress, { newValue: data });
    return newCourse;
  }

  async update(id: string, data: any, adminId: string, ipAddress: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');

    const oldValue = { ...course };
    Object.assign(course, data);
    await this.courseRepo.save(course);

    await this.auditLogService.logAction(adminId, 'UPDATE_COURSE', 'COURSE', course.id, ipAddress, { oldValue, newValue: data });
    return course;
  }

  async changeStatus(id: string, status: string, adminId: string, ipAddress: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');

    const oldStatus = course.status;
    course.status = status as ContentStatus;
    await this.courseRepo.save(course);

    await this.auditLogService.logAction(adminId, 'CHANGE_COURSE_STATUS', 'COURSE', course.id, ipAddress, { oldValue: { status: oldStatus }, newValue: { status } });
    return course;
  }
}
