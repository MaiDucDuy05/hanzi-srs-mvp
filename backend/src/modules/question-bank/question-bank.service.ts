import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ArrayContains } from 'typeorm';
import { Question, QuestionVisibility } from './entities/question.entity';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto } from './dto/question.dto';
import { Role } from '../../common/enums/user.enums';
import { findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(Question) private repo: Repository<Question>,
  ) {}

  private validateContent(type: string, content: any) {
    if (!content) throw new BadRequestException('Content is required');
    switch (type) {
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
        if (!Array.isArray(content.options) || content.options.length < 2) {
          throw new BadRequestException('MCQ must have at least 2 options');
        }
        if (!content.correctAnswer) {
          throw new BadRequestException('MCQ must have a correct answer');
        }
        break;
      case 'FILL_IN':
        if (!Array.isArray(content.acceptedAnswers) || content.acceptedAnswers.length === 0) {
          throw new BadRequestException('FILL_IN must have at least 1 accepted answer');
        }
        break;
      case 'ORDERING':
        if (!Array.isArray(content.correctOrder) || content.correctOrder.length < 2) {
          throw new BadRequestException('ORDERING must have at least 2 items');
        }
        break;
      case 'MATCHING':
        if (!Array.isArray(content.pairs) || content.pairs.length < 2) {
          throw new BadRequestException('MATCHING must have at least 2 pairs');
        }
        break;
    }
  }

  async create(dto: CreateQuestionDto, userId: string, role: string) {
    this.validateContent(dto.type, dto.content);
    const q = this.repo.create(dto as unknown as object) as Question;
    q.creatorId = userId;
    if (role === Role.ADMIN) {
      q.visibility = dto.visibility || QuestionVisibility.PUBLIC;
    } else {
      q.visibility = QuestionVisibility.PRIVATE;
    }
    return this.repo.save(q);
  }

  async findAll(q: QueryQuestionDto, userId: string, role: string) {
    const { page = 1, limit = 50, type, visibility, hskLevel, difficulty, tags, search } = q;
    
    // Build query builder
    const qb = this.repo.createQueryBuilder('q');
    
    // Visibility/Ownership rules
    if (role === Role.ADMIN) {
      if (visibility) qb.andWhere('q.visibility = :visibility', { visibility });
    } else if (role === Role.TEACHER) {
      if (visibility === QuestionVisibility.PUBLIC) {
        qb.andWhere('q.visibility = :v', { v: QuestionVisibility.PUBLIC });
      } else if (visibility === QuestionVisibility.PRIVATE) {
        qb.andWhere('q.creatorId = :userId', { userId });
        qb.andWhere('q.visibility = :v', { v: QuestionVisibility.PRIVATE });
      } else {
        // Show their own private OR public
        qb.andWhere('(q.visibility = :pub OR q.creatorId = :userId)', { pub: QuestionVisibility.PUBLIC, userId });
      }
    }

    if (type) qb.andWhere('q.type = :type', { type });
    if (hskLevel) qb.andWhere('q.hskLevel = :hskLevel', { hskLevel });
    if (difficulty) qb.andWhere('q.difficulty = :difficulty', { difficulty });
    
    if (tags) {
      // Tags might be comma-separated
      const tagList = tags.split(',').map(t => t.trim());
      qb.andWhere('q.tags @> :tags', { tags: tagList });
    }

    if (search) {
      // Simplistic JSON search for content
      qb.andWhere('q.content::text ILIKE :search', { search: `%${search}%` });
    }

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('q.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, userId: string, role: string) {
    const q = await findOrNotFound(this.repo, id, 'Question');
    if (role !== Role.ADMIN) {
      if (q.visibility === QuestionVisibility.PRIVATE && q.creatorId !== userId) {
        throw new ForbiddenException('Cannot access this question');
      }
    }
    return q;
  }

  async update(id: string, dto: UpdateQuestionDto, userId: string, role: string) {
    const q = await this.findById(id, userId, role);
    if (role !== Role.ADMIN && q.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own questions');
    }
    if (dto.content) this.validateContent(dto.type || q.type, dto.content);
    
    Object.assign(q, dto);
    
    if (role !== Role.ADMIN) {
      q.visibility = QuestionVisibility.PRIVATE; // Enforce private for teachers
    }

    return this.repo.save(q);
  }

  async delete(id: string, userId: string, role: string) {
    const q = await this.findById(id, userId, role);
    if (role !== Role.ADMIN && q.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own questions');
    }
    // "Không xoá được câu hỏi đã dùng trong bài kiểm tra có submission."
    // Question Bank questions are COPIED into TestQuestions, so deleting from Bank DOES NOT affect existing tests!
    // Therefore, we can just remove it from Bank.
    await this.repo.softRemove(q);
  }
}
