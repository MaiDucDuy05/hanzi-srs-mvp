import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { YctLevel } from '../entities/yct-level.entity';
import { YctLesson } from '../entities/yct-lesson.entity';
import { YctVocabulary } from '../entities/yct-vocabulary.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { S3UploadService } from '../../admin-content/services/s3-upload.service';
import {
  CreateYctLessonDto,
  CreateYctVocabularyDto,
  UpdateYctLessonDto,
  UpdateYctVocabularyDto,
  YctLessonQueryDto,
  YctVocabularyQueryDto,
} from '../dto/yct-curriculum.dto';

@Injectable()
export class AdminYctService {
  constructor(
    @InjectRepository(YctLevel)
    private readonly levelRepo: Repository<YctLevel>,
    @InjectRepository(YctLesson)
    private readonly lessonRepo: Repository<YctLesson>,
    @InjectRepository(YctVocabulary)
    private readonly vocabRepo: Repository<YctVocabulary>,
    private readonly auditLogService: AuditLogService,
    private readonly s3UploadService: S3UploadService,
  ) {}

  // ── Levels ────────────────────────────────────────────────────────────────
  async getLevels() {
    return this.levelRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async updateLevel(id: string, data: any, adminId: string, ip: string) {
    const level = await this.levelRepo.findOne({ where: { id } });
    if (!level) throw new NotFoundException('Không tìm thấy cấp độ YCT');

    const oldValue = { ...level };
    Object.assign(level, data);
    const saved = await this.levelRepo.save(level);

    await this.auditLogService.logAction(adminId, 'UPDATE_YCT_LEVEL', 'YCT_LEVEL', id, ip, {
      oldValue,
      newValue: data,
    });

    return saved;
  }

  // ── Lessons ───────────────────────────────────────────────────────────────
  async getLessons(query: YctLessonQueryDto) {
    const limit = query.limit || 20;
    const page = query.page || 1;

    const qb = this.lessonRepo.createQueryBuilder('l')
      .leftJoinAndSelect('l.level', 'level')
      .where('l.deletedAt IS NULL');

    if (query.levelId) {
      qb.andWhere('l.levelId = :levelId', { levelId: query.levelId });
    }
    if (query.status) {
      qb.andWhere('l.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere('(l.title ILIKE :s OR l.description ILIKE :s)', { s: `%${query.search}%` });
    }

    qb.orderBy('l.displayOrder', 'ASC')
      .addOrderBy('l.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getLesson(id: string) {
    const lesson = await this.lessonRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['level'],
    });
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học YCT');
    const vocabularies = await this.vocabRepo.find({
      where: { lessonId: id, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
    return { ...lesson, vocabularies };
  }

  async createLesson(dto: CreateYctLessonDto, adminId: string, ip: string) {
    const lesson = this.lessonRepo.create(dto);
    const saved = await this.lessonRepo.save(lesson);

    await this.auditLogService.logAction(adminId, 'CREATE_YCT_LESSON', 'YCT_LESSON', saved.id, ip, {
      newValue: dto,
    });

    return saved;
  }

  async updateLesson(id: string, dto: UpdateYctLessonDto, adminId: string, ip: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học YCT');

    const oldValue = { ...lesson };
    Object.assign(lesson, dto);
    const saved = await this.lessonRepo.save(lesson);

    await this.auditLogService.logAction(adminId, 'UPDATE_YCT_LESSON', 'YCT_LESSON', id, ip, {
      oldValue,
      newValue: dto,
    });

    return saved;
  }

  async deleteLesson(id: string, adminId: string, ip: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học YCT');

    lesson.deletedAt = new Date();
    await this.lessonRepo.save(lesson);

    await this.auditLogService.logAction(adminId, 'DELETE_YCT_LESSON', 'YCT_LESSON', id, ip, {});
    return { success: true };
  }

  // ── Vocabularies ──────────────────────────────────────────────────────────
  async getVocabularies(query: YctVocabularyQueryDto) {
    const limit = query.limit || 20;
    const page = query.page || 1;

    const qb = this.vocabRepo.createQueryBuilder('v')
      .leftJoinAndSelect('v.level', 'level')
      .leftJoinAndSelect('v.lesson', 'lesson')
      .where('v.deletedAt IS NULL');

    if (query.levelId) {
      qb.andWhere('v.levelId = :levelId', { levelId: query.levelId });
    }
    if (query.lessonId) {
      qb.andWhere('v.lessonId = :lessonId', { lessonId: query.lessonId });
    }
    if (query.status) {
      qb.andWhere('v.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere('(v.hanzi ILIKE :s OR v.pinyin ILIKE :s OR v.meaningVi ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    qb.orderBy('v.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getVocabulary(id: string) {
    const vocab = await this.vocabRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['level', 'lesson'],
    });
    if (!vocab) throw new NotFoundException('Không tìm thấy từ vựng YCT');
    return vocab;
  }

  private normalizeImageKey(imageKey?: string | null): string | null {
    if (!imageKey) return null;
    if (imageKey.includes('.amazonaws.com/')) {
      const key = imageKey.split('.amazonaws.com/')[1];
      return `/api/v1/resources/public/${key}`;
    }
    if (imageKey.startsWith('yct-images/') || imageKey.startsWith('uploads/') || imageKey.startsWith('resources/')) {
      return `/api/v1/resources/public/${imageKey}`;
    }
    return imageKey;
  }

  async createVocabulary(dto: CreateYctVocabularyDto, adminId: string, ip: string) {
    if (dto.imageKey) {
      dto.imageKey = this.normalizeImageKey(dto.imageKey) || dto.imageKey;
    }
    const vocab = this.vocabRepo.create(dto);
    const saved = await this.vocabRepo.save(vocab);

    await this.auditLogService.logAction(adminId, 'CREATE_YCT_VOCAB', 'YCT_VOCABULARY', saved.id, ip, {
      newValue: dto,
    });

    return saved;
  }

  async updateVocabulary(id: string, dto: UpdateYctVocabularyDto, adminId: string, ip: string) {
    const vocab = await this.vocabRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!vocab) throw new NotFoundException('Không tìm thấy từ vựng YCT');

    if (dto.imageKey !== undefined) {
      dto.imageKey = this.normalizeImageKey(dto.imageKey) || dto.imageKey;
    }

    const oldValue = { ...vocab };
    Object.assign(vocab, dto);
    const saved = await this.vocabRepo.save(vocab);

    await this.auditLogService.logAction(adminId, 'UPDATE_YCT_VOCAB', 'YCT_VOCABULARY', id, ip, {
      oldValue,
      newValue: dto,
    });

    return saved;
  }

  async deleteVocabulary(id: string, adminId: string, ip: string) {
    const vocab = await this.vocabRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!vocab) throw new NotFoundException('Không tìm thấy từ vựng YCT');

    vocab.deletedAt = new Date();
    await this.vocabRepo.save(vocab);

    await this.auditLogService.logAction(adminId, 'DELETE_YCT_VOCAB', 'YCT_VOCABULARY', id, ip, {});
    return { success: true };
  }

  // ── S3 Image Upload ───────────────────────────────────────────────────────
  async uploadImage(file: Express.Multer.File): Promise<string> {
    const rawUrl = await this.s3UploadService.uploadFile(file, 'yct-images');
    if (rawUrl.includes('.amazonaws.com/')) {
      const key = rawUrl.split('.amazonaws.com/')[1];
      return `/api/v1/resources/public/${key}`;
    }
    return rawUrl;
  }
}
