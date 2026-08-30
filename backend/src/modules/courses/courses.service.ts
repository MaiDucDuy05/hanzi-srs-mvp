import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Course } from './entities/course.entity';
import { CourseLesson } from './entities/course-lesson.entity';
import { CreateCourseDto, UpdateCourseDto, CreateCourseLessonDto, UpdateCourseLessonDto, CourseQueryDto, CourseLessonQueryDto } from './dto/courses.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

// TTL constants (milliseconds)
const TTL_COURSES = 300_000;    // 5 phút — courses ít thay đổi
const TTL_LESSONS = 300_000;    // 5 phút — course-lessons ít thay đổi

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private repo: Repository<Course>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(q: CourseQueryDto) {
    const { page = 1, limit = 20, sortBy = 'displayOrder', sortOrder = 'ASC', audience, status } = q;
    const cacheKey = `courses:list:${page}:${limit}:${sortBy}:${sortOrder}:${audience ?? ''}:${status ?? ''}`;
    const cached = await this.cacheManager.get<object>(cacheKey);
    if (cached) return cached;

      const where: any = {};
      if (audience) where.audience = audience;
      if (status) where.status = status;
      const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
      const result = paginatedResult(data, total, page, limit);
      await this.cacheManager.set(cacheKey, result, TTL_COURSES);
      return result;
  }

  async findById(id: string) {
    const cacheKey = `courses:id:${id}`;
    const cached = await this.cacheManager.get<object>(cacheKey);
    if (cached) return cached;

    const result = await findOrNotFound(this.repo, id, 'Course');
    await this.cacheManager.set(cacheKey, result, TTL_COURSES);
    return result;
  }

  async create(dto: CreateCourseDto) {
    const result = await this.repo.save(this.repo.create(dto as any));
    // Invalidate list cache khi có course mới
    await this.cacheManager.clear();
    return result;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const e = await findOrNotFound(this.repo, id, 'Course');
    Object.assign(e, dto);
    const result = await this.repo.save(e);
    await this.cacheManager.del(`courses:id:${id}`);
    await this.cacheManager.clear();
    return result;
  }

  async softDelete(id: string) {
    await this.repo.softRemove(await findOrNotFound(this.repo, id, 'Course'));
    await this.cacheManager.del(`courses:id:${id}`);
    await this.cacheManager.clear();
  }
}

@Injectable()
export class CourseLessonService {
  constructor(
    @InjectRepository(CourseLesson) private repo: Repository<CourseLesson>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(q: CourseLessonQueryDto) {
    const { page = 1, limit = 20, courseId } = q;
    const cacheKey = `course-lessons:${courseId ?? 'all'}:${page}:${limit}`;
    const cached = await this.cacheManager.get<object>(cacheKey);
    if (cached) return cached;

      const where: any = {};
      if (courseId) where.courseId = courseId;
      const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
      const result = paginatedResult(data, total, page, limit);
      await this.cacheManager.set(cacheKey, result, TTL_LESSONS);
      return result;
  }

  async findById(id: string) { return findOrNotFound(this.repo, id, 'Course lesson'); }

  async create(dto: CreateCourseLessonDto) {
    const result = await this.repo.save(this.repo.create(dto as any));
    await this.cacheManager.clear();
    return result;
  }

  async update(id: string, dto: UpdateCourseLessonDto) {
    const e = await findOrNotFound(this.repo, id, 'Course lesson');
    Object.assign(e, dto);
    const result = await this.repo.save(e);
    await this.cacheManager.clear();
    return result;
  }

  async delete(id: string) {
    await this.repo.remove(await findOrNotFound(this.repo, id, 'Course lesson'));
    await this.cacheManager.clear();
  }
}

