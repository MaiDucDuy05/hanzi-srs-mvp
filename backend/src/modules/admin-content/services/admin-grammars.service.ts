import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarPoint } from '../../curriculum/entities/grammar-point.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

@Injectable()
export class AdminGrammarsService {
  constructor(
    @InjectRepository(GrammarPoint) private readonly grammarRepo: Repository<GrammarPoint>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    
    const qb = this.grammarRepo.createQueryBuilder('grammar')
      .where('grammar.isActive = :isActive', { isActive: true })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('grammar.createdAt', 'DESC');

    if (query.status) qb.andWhere('grammar.status = :status', { status: query.status });
    if (query.search) qb.andWhere('grammar.title ILIKE :search', { search: `%${query.search}%` });
    if (query.levelId) qb.andWhere('grammar.levelId = :levelId', { levelId: query.levelId });

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async create(data: any, adminId: string, ipAddress: string) {
    const newGrammar = this.grammarRepo.create({
      ...data,
      status: data.status || ContentStatus.DRAFT,
    }) as unknown as GrammarPoint;
    
    await this.grammarRepo.save(newGrammar);
    await this.auditLogService.logAction(adminId, 'CREATE_GRAMMAR', 'GRAMMAR', newGrammar.id, ipAddress, { newValue: data });
    return newGrammar;
  }

  async update(id: string, data: any, adminId: string, ipAddress: string) {
    const grammar = await this.grammarRepo.findOne({ where: { id, isActive: true } });
    if (!grammar) throw new NotFoundException('Grammar not found');

    const oldValue = { ...grammar };
    Object.assign(grammar, data);
    await this.grammarRepo.save(grammar);

    await this.auditLogService.logAction(adminId, 'UPDATE_GRAMMAR', 'GRAMMAR', grammar.id, ipAddress, { oldValue, newValue: data });
    return grammar;
  }

  async remove(id: string, adminId: string, ipAddress: string) {
    const grammar = await this.grammarRepo.findOne({ where: { id, isActive: true } });
    if (!grammar) throw new NotFoundException('Grammar not found');

    grammar.isActive = false;
    grammar.deletedAt = new Date();
    await this.grammarRepo.save(grammar);

    await this.auditLogService.logAction(adminId, 'DELETE_GRAMMAR', 'GRAMMAR', grammar.id, ipAddress, { oldValue: grammar });
  }
}
