import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonContent } from './entities/lesson-content.entity';
import { LessonContentQueryDto } from './dto/curriculum.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class LessonContentService {
  constructor(@InjectRepository(LessonContent) private repo: Repository<LessonContent>) {}
  async findAll(q: LessonContentQueryDto) {
    const { page = 1, limit = 20, lessonId } = q;
    const where: any = {};
    if (lessonId) where.lessonId = lessonId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
    
    // Manual polymorphic join
    for (const item of data) {
      if (item.contentType === 'VOCABULARY') {
        const vocab = await this.repo.manager.query(`SELECT id, hanzi, pinyin, meaning_vi FROM vocabularies WHERE id = $1`, [item.contentId]);
        if (vocab[0]) (item as any).vocabulary = vocab[0];
      } else if (item.contentType === 'GRAMMAR') {
        const grammar = await this.repo.manager.query(`SELECT id, title, structure FROM grammar_points WHERE id = $1`, [item.contentId]);
        if (grammar[0]) (item as any).grammar = grammar[0];
      }
    }
    
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Lesson content'); }
}
