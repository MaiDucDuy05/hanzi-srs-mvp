import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRequest } from './entities/contact-request.entity';
import * as DTO from './dto/resources.dto';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';
import { MailService } from '../mail/mail.service';
import { ContactStatus } from '../../common/enums/resources.enums';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactRequest) private repo: Repository<ContactRequest>,
    private mailService: MailService,
  ) {}

  async findAll(q: DTO.ContactRequestQueryDto) {
    const { page = 1, limit = 20, status } = q;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }

  async findById(id: string) { return findOrNotFound(this.repo, id, 'Contact request'); }

  async create(dto: DTO.CreateContactRequestDto) { 
    const req = this.repo.create(dto as Partial<ContactRequest>);
    await this.repo.save(req);
    // Send auto-reply to the user
    this.mailService.sendContactConfirmationEmail(req.email, req.name).catch(() => {});
    return req;
  }

  async update(id: string, dto: DTO.UpdateContactRequestDto) { 
    const e = await this.findById(id); 
    Object.assign(e, dto); 
    return this.repo.save(e); 
  }

  async reply(id: string, replyMessage: string) {
    const e = await this.findById(id);
    await this.mailService.sendContactReplyEmail(e.email, e.name, replyMessage);
    e.status = ContactStatus.CLOSED;
    return this.repo.save(e);
  }
}
