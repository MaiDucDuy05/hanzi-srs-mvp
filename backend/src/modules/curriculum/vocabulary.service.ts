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
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', levelId, status, search } = q;
    const where: any = {};
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    if (search) {
      where.hanzi = ILike(`%${search}%`);
    }
    const [data, total] = await this.repo.findAndCount({
      where: search
        ? [
            { ...where, hanzi: ILike(`%${search}%`) },
            { ...where, pinyin: ILike(`%${search}%`) },
            { ...where, meaningVi: ILike(`%${search}%`) },
          ]
        : where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Vocabulary'); }
  async create(dto: CreateVocabularyDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateVocabularyDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}
