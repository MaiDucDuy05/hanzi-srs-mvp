import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContactService } from './contact-request.service';
import { ContactRequest } from './entities/contact-request.entity';
import { MailService } from '../mail/mail.service';
import { ContactStatus } from '../../common/enums/resources.enums';

describe('ContactService', () => {
  let service: ContactService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
  };
  const mail = {
    sendContactConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendContactReplyEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: getRepositoryToken(ContactRequest), useValue: repo },
        { provide: MailService, useValue: mail },
      ],
    }).compile();
    service = mod.get(ContactService);
    jest.clearAllMocks();
  });

  it('findAll paginates with status filter', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'c1' }], 1]);
    await service.findAll({ status: ContactStatus.NEW, page: 1, limit: 20 } as any);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: ContactStatus.NEW } }),
    );
  });

  it('create persists request and fires confirmation email without awaiting it', async () => {
    const out = await service.create({ name: 'A', email: 'a@b.c', message: 'hi' } as any);
    expect(repo.save).toHaveBeenCalled();
    expect(mail.sendContactConfirmationEmail).toHaveBeenCalledWith('a@b.c', 'A');
    expect(out).toBeDefined();
  });

  it('create swallows mail errors silently', async () => {
    mail.sendContactConfirmationEmail.mockRejectedValueOnce(new Error('smtp down'));
    await expect(
      service.create({ name: 'A', email: 'a@b.c', message: 'hi' } as any),
    ).resolves.toBeDefined();
  });

  it('reply sends mail and closes the request', async () => {
    const entry: any = { id: 'c1', email: 'a@b.c', name: 'A', status: ContactStatus.NEW };
    repo.findOne.mockResolvedValue(entry);
    await service.reply('c1', 'we are on it');
    expect(mail.sendContactReplyEmail).toHaveBeenCalledWith('a@b.c', 'A', 'we are on it');
    expect(entry.status).toBe(ContactStatus.CLOSED);
    expect(repo.save).toHaveBeenCalledWith(entry);
  });

  it('update merges fields into the existing request', async () => {
    const entry: any = { id: 'c1', status: ContactStatus.NEW };
    repo.findOne.mockResolvedValue(entry);
    await service.update('c1', { status: ContactStatus.IN_PROGRESS } as any);
    expect(entry.status).toBe(ContactStatus.IN_PROGRESS);
    expect(repo.save).toHaveBeenCalledWith(entry);
  });
});
