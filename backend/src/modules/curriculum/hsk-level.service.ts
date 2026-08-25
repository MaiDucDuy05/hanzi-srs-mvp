import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HskLevel } from './entities/hsk-level.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { ContentStatus } from '../../common/enums/curriculum.enums';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

export interface HskLevelWithCount extends HskLevel {
  vocabularyCount: number;
}

@Injectable()
export class HskLevelService {
  constructor(
    @InjectRepository(HskLevel) private repo: Repository<HskLevel>,
    @InjectRepository(Vocabulary) private vocabRepo: Repository<Vocabulary>,
  ) {}

  async findAll(q: PaginationQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
    } = q;
    const [data, total] = await this.repo.findAndCount({
      where: {
        isActive: true,
        status: ContentStatus.PUBLISHED,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    if (data.length === 0) {
      return paginatedResult(data, total, page, limit);
    }

    // Batch count vocabularies per level
    const levelIds = data.map((l) => l.id);
    const counts = await this.vocabRepo
      .createQueryBuilder('v')
      .select('v.level_id', 'levelId')
      .addSelect('COUNT(*)', 'count')
      .where('v.level_id IN (:...ids)', { ids: levelIds })
      .groupBy('v.level_id')
      .getRawMany<{ levelId: string; count: string }>();

    const countMap = new Map(
      counts.map((c) => [c.levelId, parseInt(c.count, 10)]),
    );
    const result: HskLevelWithCount[] = data.map((level) => ({
      ...level,
      vocabularyCount: countMap.get(level.id) ?? 0,
    }));

    return paginatedResult(result, total, page, limit);
  }

  async findById(id: string): Promise<HskLevelWithCount> {
    const level = await this.repo.findOne({ where: { id, isActive: true, status: ContentStatus.PUBLISHED } });
    if (!level) throw new Error('HSK level not found');
    const count = await this.vocabRepo.count({ where: { levelId: id } });
    return { ...level, vocabularyCount: count } as HskLevelWithCount;
  }
}
