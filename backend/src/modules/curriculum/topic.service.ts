import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';
import {
  CreateTopicDto,
  UpdateTopicDto,
  TopicQueryDto,
} from './dto/curriculum.dto';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

export interface TopicWithCount extends Topic {
  vocabularyCount: number;
}

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic) private repo: Repository<Topic>,
    @InjectRepository(TopicVocabulary)
    private tvRepo: Repository<TopicVocabulary>,
  ) {}

  async findAll(q: TopicQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      status,
    } = q;
    const where: FindOptionsWhere<Topic> = {};
    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (where as any).status = status;
    }
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    if (data.length === 0) {
      return paginatedResult(data, total, page, limit);
    }

    // Batch count vocabularies per topic via join table
    const topicIds = data.map((t) => t.id);
    const counts = await this.tvRepo
      .createQueryBuilder('tv')
      .select('tv.topic_id', 'topicId')
      .addSelect('COUNT(*)', 'count')
      .where('tv.topic_id IN (:...ids)', { ids: topicIds })
      .groupBy('tv.topic_id')
      .getRawMany<{ topicId: string; count: string }>();

    const countMap = new Map(
      counts.map((c) => [c.topicId, parseInt(c.count, 10)]),
    );
    const result: TopicWithCount[] = data.map((topic) => ({
      ...topic,
      vocabularyCount: countMap.get(topic.id) ?? 0,
    }));

    return paginatedResult(result, total, page, limit);
  }

  async findById(id: string): Promise<TopicWithCount> {
    const topic = await findOrNotFound<Topic>(this.repo, id, 'Topic');
    const count = await this.tvRepo.count({ where: { topicId: id } });
    return { ...topic, vocabularyCount: count };
  }

  async create(dto: CreateTopicDto) {
    return this.repo.save(this.repo.create(dto as any));
  }

  async update(id: string, dto: UpdateTopicDto) {
    const e = await this.findById(id);
    Object.assign(e, dto);
    return this.repo.save(e);
  }

  async softDelete(id: string) {
    await this.repo.softRemove(await this.findById(id));
  }
}
