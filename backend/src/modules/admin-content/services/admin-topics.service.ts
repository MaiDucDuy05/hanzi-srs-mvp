import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../../curriculum/entities/topic.entity';
import { TopicVocabulary } from '../../curriculum/entities/topic-vocabulary.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

@Injectable()
export class AdminTopicsService {
  constructor(
    @InjectRepository(Topic) private readonly topicRepo: Repository<Topic>,
    @InjectRepository(TopicVocabulary) private readonly topicVocabRepo: Repository<TopicVocabulary>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: any) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    
    const qb = this.topicRepo.createQueryBuilder('topic')
      .where('topic.isActive = :isActive', { isActive: true })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('topic.displayOrder', 'ASC')
      .addOrderBy('topic.createdAt', 'DESC');

    if (query.status) qb.andWhere('topic.status = :status', { status: query.status });
    if (query.search) qb.andWhere('topic.name ILIKE :search', { search: `%${query.search}%` });

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async create(data: any, adminId: string, ipAddress: string) {
    const newTopic = this.topicRepo.create({
      ...data,
      status: data.status || ContentStatus.DRAFT,
    }) as unknown as Topic;
    
    await this.topicRepo.save(newTopic);
    await this.auditLogService.logAction(adminId, 'CREATE_TOPIC', 'TOPIC', newTopic.id, ipAddress, { newValue: data });
    return newTopic;
  }

  async update(id: string, data: any, adminId: string, ipAddress: string) {
    const topic = await this.topicRepo.findOne({ where: { id, isActive: true } });
    if (!topic) throw new NotFoundException('Topic not found');

    const oldValue = { ...topic };
    Object.assign(topic, data);
    await this.topicRepo.save(topic);

    await this.auditLogService.logAction(adminId, 'UPDATE_TOPIC', 'TOPIC', topic.id, ipAddress, { oldValue, newValue: data });
    return topic;
  }

  async updateStatus(id: string, status: string, adminId: string, ipAddress: string) {
    const topic = await this.topicRepo.findOne({ where: { id, isActive: true } });
    if (!topic) throw new NotFoundException('Topic not found');

    const oldValue = { status: topic.status };
    topic.status = status as ContentStatus;
    await this.topicRepo.save(topic);

    await this.auditLogService.logAction(adminId, 'UPDATE_TOPIC_STATUS', 'TOPIC', topic.id, ipAddress, { oldValue, newValue: { status } });
    return topic;
  }

  async getTopicVocabularies(topicId: string) {
    const records = await this.topicVocabRepo.find({
      where: { topicId },
      relations: ['vocabulary'],
      order: { displayOrder: 'ASC' }
    });
    return records.map(r => ({
      ...r.vocabulary,
      topicVocabularyId: r.id,
      displayOrder: r.displayOrder
    }));
  }

  async assignVocabularies(topicId: string, vocabIds: string[], adminId: string, ipAddress: string) {
    const existing = await this.topicVocabRepo.find({ where: { topicId } });
    const existingIds = existing.map(tv => tv.vocabularyId);
    const toAdd = vocabIds.filter(id => !existingIds.includes(id));
    
    let maxOrder = existing.length > 0 ? Math.max(...existing.map(tv => tv.displayOrder)) : 0;

    const newEntries = toAdd.map(vId => {
        maxOrder++;
        return this.topicVocabRepo.create({
            topicId,
            vocabularyId: vId,
            displayOrder: maxOrder
        });
    });

    if (newEntries.length > 0) {
        await this.topicVocabRepo.save(newEntries);
        await this.auditLogService.logAction(adminId, 'ASSIGN_TOPIC_VOCABULARIES', 'TOPIC', topicId, ipAddress, { newValue: toAdd });
    }
    return { success: true, addedCount: newEntries.length };
  }

  async removeVocabulary(topicId: string, vocabId: string, adminId: string, ipAddress: string) {
    await this.topicVocabRepo.delete({ topicId, vocabularyId: vocabId });
    await this.auditLogService.logAction(adminId, 'REMOVE_TOPIC_VOCABULARY', 'TOPIC', topicId, ipAddress, { oldValue: { vocabularyId: vocabId } });
    return { success: true };
  }
}
