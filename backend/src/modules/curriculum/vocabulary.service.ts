import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDto, UpdateVocabularyDto, VocabularyQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class VocabularyService {
  constructor(@InjectRepository(Vocabulary) private repo: Repository<Vocabulary>) {}

  async findAll(q: VocabularyQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', levelId, topicId, status, search } = q;
    const where: any = {};
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;

    let qb = this.repo.createQueryBuilder('v');

    // Apply exact match filters first
    if (Object.keys(where).length > 0) {
      qb = qb.where(where);
    }

    if (topicId) {
      // Vocabularies belonging to a topic via the join table
      qb = qb
        .innerJoin('v.topicVocabularies', 'tv', 'tv.topicId = :topicId', { topicId })
        .addSelect('tv.displayOrder')
        .orderBy('tv.displayOrder', 'ASC');
    } else if (search) {
      qb = qb
        .andWhere(
          `(LOWER(v.hanzi) LIKE LOWER(:search) OR LOWER(v.pinyin) LIKE LOWER(:search) OR LOWER(v.meaningVi) LIKE LOWER(:search))`,
          { search: `%${search}%` },
        )
        .orderBy(`v.${sortBy}`, sortOrder);
    } else {
      qb = qb.orderBy(`v.${sortBy}`, sortOrder);
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginatedResult(data, total, page, limit);
  }

  async findById(id: string) { return findOrNotFound(this.repo, id, 'Vocabulary'); }
  async create(dto: CreateVocabularyDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateVocabularyDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}
