import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseLesson } from './entities/course-lesson.entity';
import { CreateCourseDto, UpdateCourseDto, CreateCourseLessonDto, UpdateCourseLessonDto } from './dto/courses.dto';
import { PaginatedResult } from '../../common/pagination.dto';

function paginated<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function findOr404<T extends { id: string }>(repo: Repository<T>, id: string, label: string): Promise<T> {
  const e = await repo.findOne({ where: { id } as any });
  if (!e) throw new NotFoundException(`${label} not found`);
  return e;
}

@Injectable()
export class CourseService {
  constructor(@InjectRepository(Course) private repo: Repository<Course>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC', audience, status } = q;
    const where: any = {};
    if (audience) where.audience = audience;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Course'); }
  async create(dto: CreateCourseDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateCourseDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

@Injectable()
export class CourseLessonService {
  constructor(@InjectRepository(CourseLesson) private repo: Repository<CourseLesson>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, courseId } = q;
    const where: any = {};
    if (courseId) where.courseId = courseId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Course lesson'); }
  async create(dto: CreateCourseLessonDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateCourseLessonDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}
