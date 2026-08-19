import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentDto, AssignmentQueryDto } from './dto/assignment.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class AssignmentService {
  constructor(@InjectRepository(Assignment) private repo: Repository<Assignment>) {}

  async findAll(q: AssignmentQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', assignedTo, assignedBy, status } = q;
    const where: any = {};
    if (assignedTo) where.assignedTo = assignedTo;
    if (assignedBy) where.assignedBy = assignedBy;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
    return paginatedResult(data, total, page, limit);
  }

  async findById(id: string) {
    return findOrNotFound(this.repo, id, 'Assignment');
  }

  async create(dto: CreateAssignmentDto) {
    const entity = this.repo.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      vocabularyCount: 0,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const entity = await this.findById(id);
    Object.assign(entity, dto);
    if (dto.dueDate !== undefined) {
      entity.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    return this.repo.save(entity);
  }

  async delete(id: string) {
    const entity = await this.findById(id);
    await this.repo.remove(entity);
  }
}
