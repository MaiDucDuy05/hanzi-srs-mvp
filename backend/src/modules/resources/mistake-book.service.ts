import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { MistakeBook } from './entities/mistake-book.entity';
import * as DTO from './dto/resources.dto';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

@Injectable()
export class MistakeBookService {
  constructor(
    @InjectRepository(MistakeBook) private repo: Repository<MistakeBook>,
  ) {}
  async findAll(q: DTO.MistakeBookQueryDto) {
    const { page = 1, limit = 20, userId, sourceType, sourceId, since } = q;
    const where = {} as FindOptionsWhere<MistakeBook> & { createdAt?: unknown };
    if (userId) where.userId = userId;
    if (sourceType) where.sourceType = sourceType;
    if (sourceId) where.sourceId = sourceId;
    if (since) where.createdAt = MoreThanOrEqual(new Date(since));
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) {
    return findOrNotFound(this.repo, id, 'Mistake book entry');
  }
  async create(dto: DTO.CreateMistakeBookDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async delete(id: string) {
    await this.repo.remove(await this.findById(id));
  }

  async addToMistakeBook(
    userId: string,
    sourceType: string,
    sourceId: string,
    questionType: string,
    questionSnapshot: any,
    userAnswer?: any,
    correctAnswer?: any,
    questionId?: string,
    vocabularyId?: string,
  ) {
    let existing = null;
    if (questionId) {
      existing = await this.repo.findOne({ where: { userId, questionId } });
    } else if (vocabularyId) {
      existing = await this.repo.findOne({ where: { userId, vocabularyId } });
    }

    if (existing) {
      existing.failCount++;
      existing.lastFailedAt = new Date();
      existing.correctStreak = 0;
      if (userAnswer !== undefined) existing.userAnswer = userAnswer;
      if (correctAnswer !== undefined) existing.correctAnswer = correctAnswer;
      existing.sourceId = sourceId;
      existing.sourceType = sourceType;
      return this.repo.save(existing);
    }

    const count = await this.repo.count({ where: { userId } });
    if (count >= 500) {
      const oldest = await this.repo.findOne({
        where: { userId },
        order: { lastFailedAt: 'ASC' },
      });
      if (oldest) await this.repo.remove(oldest);
    }

    const newMistake = this.repo.create({
      userId,
      questionId,
      vocabularyId,
      sourceType,
      sourceId,
      questionType,
      questionSnapshot,
      userAnswer,
      correctAnswer,
    });
    return this.repo.save(newMistake);
  }

  async startReview(userId: string, filter?: string) {
    // Generate a mini quiz of up to 10 questions.
    const query = this.repo.createQueryBuilder('mb')
      .where('mb.userId = :userId', { userId });
      
    if (filter === 'recent') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);
      query.andWhere('mb.lastFailedAt >= :sevenDaysAgo', { sevenDaysAgo });
    }

    // Prioritize high fail_count and older review time
    query.orderBy('mb.failCount', 'DESC')
      .addOrderBy('mb.lastReviewedAt', 'ASC', 'NULLS FIRST')
      .limit(10);

    const questions = await query.getMany();
    // Update last_reviewed_at for these questions? No, we will update on submit, or we can update now to prevent immediate re-selection if another session starts.
    if (questions.length > 0) {
      const ids = questions.map(q => q.id);
      await this.repo.createQueryBuilder()
        .update(MistakeBook)
        .set({ lastReviewedAt: new Date() })
        .whereInIds(ids)
        .execute();
    }
    
    return questions;
  }

  async submitReview(id: string, userId: string, isCorrect: boolean) {
    const entry = await this.findById(id);
    if (entry.userId !== userId) {
      throw new Error('Not authorized to review this mistake');
    }

    if (isCorrect) {
      // User asked: "nếu trả lời đúng rồi thì xoá các câu đó ra khỏi mistake_book nhé"
      await this.repo.remove(entry);
      return { message: 'Mistake removed' };
    } else {
      entry.failCount++;
      entry.lastFailedAt = new Date();
      entry.correctStreak = 0;
      await this.repo.save(entry);
      return { message: 'Mistake updated' };
    }
  }
}
