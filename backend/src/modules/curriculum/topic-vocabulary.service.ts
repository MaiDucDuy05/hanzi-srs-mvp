import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';
import { TopicVocabularyQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class TopicVocabularyService {
  constructor(@InjectRepository(TopicVocabulary) private repo: Repository<TopicVocabulary>) {}
  async findAll(q: TopicVocabularyQueryDto) {
    const { page = 1, limit = 20, topicId } = q;
    const where: any = {};
    if (topicId) where.topicId = topicId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Topic vocabulary'); }
}
