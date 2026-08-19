import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../entities/reward.entity';
import { CreateRewardDto, UpdateRewardDto } from '../dto/rewards.dto';

/**
 * RewardsAdminService — CRUD catalog rewards (PR-33 ADR-4).
 * Admin-only (guard ở controller).
 */
@Injectable()
export class RewardsAdminService {
  constructor(
    @InjectRepository(Reward) private rewardRepo: Repository<Reward>,
  ) {}

  async findAll() {
    return this.rewardRepo.find({ order: { costExp: 'ASC' } });
  }

  async create(dto: CreateRewardDto) {
    const reward = this.rewardRepo.create({
      code: dto.code,
      title: dto.title,
      type: dto.type,
      costExp: dto.costExp,
      metadata: dto.metadata ?? {},
      active: dto.active ?? true,
    });
    return this.rewardRepo.save(reward);
  }

  async update(id: string, dto: UpdateRewardDto) {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    Object.assign(reward, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.costExp !== undefined && { costExp: dto.costExp }),
      ...(dto.metadata !== undefined && { metadata: dto.metadata }),
      ...(dto.active !== undefined && { active: dto.active }),
    });
    return this.rewardRepo.save(reward);
  }

  async toggleActive(id: string) {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    reward.active = !reward.active;
    return this.rewardRepo.save(reward);
  }

  async remove(id: string) {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    await this.rewardRepo.softRemove(reward);
    return { id };
  }
}
