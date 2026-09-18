import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../../curriculum/entities/vocabulary.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { S3UploadService } from './s3-upload.service';

@Injectable()
export class AdminVocabulariesService {
  constructor(
    @InjectRepository(Vocabulary) private readonly vocabRepo: Repository<Vocabulary>,
    private readonly auditLogService: AuditLogService,
    private readonly s3UploadService: S3UploadService,
  ) {}

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    
    const qb = this.vocabRepo.createQueryBuilder('vocab')
      .where('vocab.isActive = :isActive', { isActive: true })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('vocab.createdAt', 'DESC');

    if (query.status) qb.andWhere('vocab.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(
        '(vocab.hanzi ILIKE :search OR vocab.pinyin ILIKE :search OR vocab.meaningVi ILIKE :search)', 
        { search: `%${query.search}%` }
      );
    }
    if (query.levelId) {
      if (query.levelId === 'none') {
        qb.andWhere('vocab.levelId IS NULL');
      } else {
        qb.andWhere('vocab.levelId = :levelId', { levelId: query.levelId });
      }
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async create(data: any, adminId: string, ipAddress: string) {
    if (data.partOfSpeech && typeof data.partOfSpeech === 'string' && data.partOfSpeech.trim().length > 100) {
      throw new BadRequestException('Từ loại (partOfSpeech) không được vượt quá 100 ký tự');
    }
    const cleanPartOfSpeech = typeof data.partOfSpeech === 'string' ? data.partOfSpeech.trim() || null : data.partOfSpeech ?? null;
    const cleanLevelId = data.levelId ? data.levelId : null;
    const newVocab = this.vocabRepo.create({
      ...data,
      levelId: cleanLevelId,
      partOfSpeech: cleanPartOfSpeech,
      status: data.status || ContentStatus.DRAFT,
    }) as unknown as Vocabulary;
    
    await this.vocabRepo.save(newVocab);
    await this.auditLogService.logAction(adminId, 'CREATE_VOCAB', 'VOCABULARY', newVocab.id, ipAddress, { newValue: data });
    return newVocab;
  }

  async update(id: string, data: any, adminId: string, ipAddress: string) {
    const vocab = await this.vocabRepo.findOne({ where: { id, isActive: true } });
    if (!vocab) throw new NotFoundException('Vocabulary not found');

    if (data.partOfSpeech && typeof data.partOfSpeech === 'string' && data.partOfSpeech.trim().length > 100) {
      throw new BadRequestException('Từ loại (partOfSpeech) không được vượt quá 100 ký tự');
    }

    const oldValue = { ...vocab };
    const updateData = { ...data };
    if (updateData.partOfSpeech !== undefined) {
      updateData.partOfSpeech = typeof updateData.partOfSpeech === 'string' ? updateData.partOfSpeech.trim() || null : updateData.partOfSpeech ?? null;
    }
    Object.assign(vocab, updateData);
    await this.vocabRepo.save(vocab);

    await this.auditLogService.logAction(adminId, 'UPDATE_VOCAB', 'VOCABULARY', vocab.id, ipAddress, { oldValue, newValue: data });
    return vocab;
  }

  async softDelete(id: string, adminId: string, ipAddress: string) {
    const vocab = await this.vocabRepo.findOne({ where: { id, isActive: true } });
    if (!vocab) throw new NotFoundException('Vocabulary not found');

    // Soft delete
    vocab.isActive = false;
    vocab.deletedAt = new Date();
    await this.vocabRepo.save(vocab);

    await this.auditLogService.logAction(adminId, 'DELETE_VOCAB', 'VOCABULARY', vocab.id, ipAddress, {});
    return { success: true };
  }

  async bulkSoftDelete(ids: string[], adminId: string, ipAddress: string) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { success: true, count: 0 };
    }

    const result = await this.vocabRepo.createQueryBuilder()
      .update(Vocabulary)
      .set({ isActive: false, deletedAt: new Date() })
      .where('id IN (:...ids) AND isActive = :isActive', { ids, isActive: true })
      .execute();

    const affectedCount = result.affected || 0;
    await this.auditLogService.logAction(
      adminId,
      'BULK_DELETE_VOCAB',
      'VOCABULARY',
      'bulk',
      ipAddress,
      { oldValue: { requestedIds: ids }, newValue: { count: affectedCount } },
    );

    return { success: true, count: affectedCount };
  }

  async exportCsv() {
    const vocabs = await this.vocabRepo.find({ 
      where: { isActive: true },
      relations: ['level']
    });
    let csv = 'hanzi,pinyin,meaning_vi,part_of_speech,example,hsk_level\n';
    vocabs.forEach(v => {
      // Format basic CSV with quotes for text fields
      csv += `"${v.hanzi}","${v.pinyin}","${v.meaningVi || ''}","${v.partOfSpeech || ''}","${(v.example || '').replace(/"/g, '""')}","${v.level?.name || ''}"\n`;
    });
    return csv;
  }

  async uploadAudio(id: string, file: Express.Multer.File, adminId: string, ipAddress: string) {
    const vocab = await this.vocabRepo.findOne({ where: { id, isActive: true } });
    if (!vocab) throw new NotFoundException('Vocabulary not found');

    const fileUrl = await this.s3UploadService.uploadFile(file, 'audio');
    const oldValue = { audioKey: vocab.audioKey };
    vocab.audioKey = fileUrl;
    await this.vocabRepo.save(vocab);

    await this.auditLogService.logAction(adminId, 'UPDATE_VOCAB_AUDIO', 'VOCABULARY', vocab.id, ipAddress, { oldValue, newValue: { audioKey: fileUrl } });
    return vocab;
  }
}
