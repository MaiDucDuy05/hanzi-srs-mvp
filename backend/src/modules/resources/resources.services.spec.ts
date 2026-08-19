import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MistakeBookService } from './mistake-book.service';
import { AiJobService } from './ai-generation-job.service';
import { SpeakingService } from './speaking-attempt.service';
import { ContactService } from './contact-request.service';
import { ResourceService } from './resource.service';
import { MistakeBook } from './entities/mistake-book.entity';
import { AiGenerationJob } from './entities/ai-generation-job.entity';
import { SpeakingAttempt } from './entities/speaking-attempt.entity';
import { ContactRequest } from './entities/contact-request.entity';
import { Resource } from './entities/resource.entity';
import { AiJobStatus, SpeakingStatus, ResourceTier } from '../../common/enums/resources.enums';
import { Role } from '../../common/enums/user.enums';
import { SubscriptionService } from '../subscription/subscription.service';
import { VipUpgradeService } from '../subscription/vip-upgrade-request.service';
import { VipUpgradeRequest } from '../subscription/entities/vip-upgrade-request.entity';

describe('MistakeBookService', () => {
  let service: MistakeBookService;
  let repo: jest.Mocked<Repository<MistakeBook>>;

  const mockEntry: MistakeBook = {
    id: 'entry-1',
    userId: 'user-1',
    sourceType: 'LESSON',
    sourceId: 'lesson-1',
    vocabularyId: 'vocab-1',
    question: 'What is 2+2?',
    userAnswer: '3',
    correctAnswer: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MistakeBookService,
        { provide: getRepositoryToken(MistakeBook), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<MistakeBookService>(MistakeBookService);
    repo = module.get(getRepositoryToken(MistakeBook));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated entries', async () => {
      repo.findAndCount.mockResolvedValue([[mockEntry], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockEntry]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by userId', async () => {
      repo.findAndCount.mockResolvedValue([[mockEntry], 1]);

      await service.findAll({ userId: 'user-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('should filter by sourceType', async () => {
      repo.findAndCount.mockResolvedValue([[mockEntry], 1]);

      await service.findAll({ sourceType: 'LESSON' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sourceType: 'LESSON' } }),
      );
    });

    it('should filter by sourceId', async () => {
      repo.findAndCount.mockResolvedValue([[mockEntry], 1]);

      await service.findAll({ sourceId: 'lesson-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sourceId: 'lesson-1' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return entry when found', async () => {
      repo.findOne.mockResolvedValue(mockEntry);

      const result = await service.findById('entry-1');

      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Mistake book entry not found');
    });
  });

  describe('create', () => {
    it('should create new entry', async () => {
      const createDto = { userId: 'user-1', sourceType: 'TOPIC' as const, sourceId: 'topic-1', question: 'Test?', userAnswer: 'A', correctAnswer: 'B' };
      repo.create.mockReturnValue({ ...mockEntry, ...createDto } as MistakeBook);
      repo.save.mockResolvedValue({ ...mockEntry, ...createDto } as MistakeBook);

      const result = await service.create(createDto);

      expect(result.question).toBe('Test?');
    });
  });

  describe('delete', () => {
    it('should permanently delete entry', async () => {
      repo.findOne.mockResolvedValue(mockEntry);
      repo.remove.mockResolvedValue(mockEntry);

      await service.delete('entry-1');

      expect(repo.remove).toHaveBeenCalled();
    });
  });
});

describe('AiJobService', () => {
  let service: AiJobService;
  let repo: jest.Mocked<Repository<AiGenerationJob>>;

  const mockJob: AiGenerationJob = {
    id: 'job-1',
    userId: 'user-1',
    jobType: 'GENERATE_VOCABULARY',
    status: AiJobStatus.PENDING,
    inputData: {},
    outputData: null,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiJobService,
        { provide: getRepositoryToken(AiGenerationJob), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AiJobService>(AiJobService);
    repo = module.get(getRepositoryToken(AiGenerationJob));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated jobs', async () => {
      repo.findAndCount.mockResolvedValue([[mockJob], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockJob]);
    });

    it('should filter by userId', async () => {
      repo.findAndCount.mockResolvedValue([[mockJob], 1]);

      await service.findAll({ userId: 'user-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockJob], 1]);

      await service.findAll({ status: AiJobStatus.PENDING });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: AiJobStatus.PENDING } }),
      );
    });
  });

  describe('findById', () => {
    it('should return job when found', async () => {
      repo.findOne.mockResolvedValue(mockJob);

      const result = await service.findById('job-1');

      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('AI job not found');
    });
  });

  describe('create', () => {
    it('should create job with PENDING status', async () => {
      const createDto = { userId: 'user-1', jobType: 'GENERATE_GRAMMAR', inputData: {} };
      repo.create.mockReturnValue({ ...mockJob, ...createDto } as AiGenerationJob);
      repo.save.mockResolvedValue({ ...mockJob, ...createDto } as AiGenerationJob);

      const result = await service.create(createDto);

      expect(result.status).toBe(AiJobStatus.PENDING);
    });
  });

  describe('updateStatus', () => {
    it('should update status to COMPLETED with outputData', async () => {
      repo.findOne.mockResolvedValue(mockJob);
      repo.save.mockImplementation((e) => Promise.resolve(e as AiGenerationJob));

      const result = await service.updateStatus('job-1', AiJobStatus.COMPLETED, { generated: [] });

      expect(result.status).toBe(AiJobStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });

    it('should update status to FAILED with error', async () => {
      repo.findOne.mockResolvedValue(mockJob);
      repo.save.mockImplementation((e) => Promise.resolve(e as AiGenerationJob));

      const result = await service.updateStatus('job-1', AiJobStatus.FAILED, undefined, 'Generation failed');

      expect(result.status).toBe(AiJobStatus.FAILED);
      expect(result.error).toBe('Generation failed');
      expect(result.completedAt).toBeDefined();
    });

    it('should not set completedAt for non-terminal status', async () => {
      // Return a fresh copy each time to avoid mutation issues
      const jobWithNull = { ...mockJob, completedAt: null };
      repo.findOne.mockImplementation(() => Promise.resolve({ ...jobWithNull }));
      repo.save.mockImplementation((e) => Promise.resolve({ ...e, completedAt: null }));

      const result = await service.updateStatus('job-1', AiJobStatus.PROCESSING);

      expect(result.completedAt).toBeNull();
    });
  });
});

describe('SpeakingService', () => {
  let service: SpeakingService;
  let repo: jest.Mocked<Repository<SpeakingAttempt>>;

  const mockAttempt: SpeakingAttempt = {
    id: 'attempt-1',
    userId: 'user-1',
    audioKey: '/audio/speaking-1.m4a',
    status: SpeakingStatus.SUBMITTED,
    score: null,
    feedback: null,
    gradedBy: null,
    submittedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakingService,
        { provide: getRepositoryToken(SpeakingAttempt), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SpeakingService>(SpeakingService);
    repo = module.get(getRepositoryToken(SpeakingAttempt));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated attempts', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockAttempt]);
    });

    it('should filter by userId', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ userId: 'user-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ status: SpeakingStatus.SUBMITTED });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: SpeakingStatus.SUBMITTED } }),
      );
    });

    it('should sort by submittedAt DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { submittedAt: 'DESC' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return attempt when found', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1');

      expect(result).toEqual(mockAttempt);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Speaking attempt not found');
    });
  });

  describe('create', () => {
    it('should create new attempt with userId', async () => {
      const createDto = { audioKey: '/audio/new.m4a' };
      repo.create.mockReturnValue({ ...mockAttempt, ...createDto } as SpeakingAttempt);
      repo.save.mockResolvedValue({ ...mockAttempt, ...createDto } as SpeakingAttempt);

      const result = await service.create(createDto, 'user-1');

      expect(result.audioKey).toBe('/audio/new.m4a');
      expect(result.userId).toBe('user-1');
      expect(result.submittedAt).toBeDefined();
    });
  });

  describe('grade', () => {
    it('should grade attempt', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);
      repo.save.mockImplementation((e) => Promise.resolve(e as SpeakingAttempt));

      const result = await service.grade('attempt-1', { score: 85, feedback: 'Good!' }, 'teacher-1');

      expect(result.status).toBe(SpeakingStatus.GRADED);
      expect(result.score).toBe(85);
      expect(result.feedback).toBe('Good!');
      expect(result.gradedBy).toBe('teacher-1');
    });
  });
});

describe('ContactService', () => {
  let service: ContactService;
  let repo: jest.Mocked<Repository<ContactRequest>>;

  const mockRequest: ContactRequest = {
    id: 'request-1',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test',
    message: 'Hello',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: getRepositoryToken(ContactRequest), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    repo = module.get(getRepositoryToken(ContactRequest));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated requests', async () => {
      repo.findAndCount.mockResolvedValue([[mockRequest], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockRequest]);
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockRequest], 1]);

      await service.findAll({ status: 'PENDING' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return request when found', async () => {
      repo.findOne.mockResolvedValue(mockRequest);

      const result = await service.findById('request-1');

      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Contact request not found');
    });
  });

  describe('create', () => {
    it('should create new request', async () => {
      const createDto = { name: 'Jane', email: 'jane@example.com', subject: 'Help', message: 'Please' };
      repo.create.mockReturnValue({ ...mockRequest, ...createDto } as ContactRequest);
      repo.save.mockResolvedValue({ ...mockRequest, ...createDto } as ContactRequest);

      const result = await service.create(createDto);

      expect(result.name).toBe('Jane');
    });
  });

  describe('update', () => {
    it('should update request', async () => {
      repo.findOne.mockResolvedValue(mockRequest);
      repo.save.mockImplementation((e) => Promise.resolve(e as ContactRequest));

      const result = await service.update('request-1', { status: 'REPLIED' });

      expect(result.status).toBe('REPLIED');
    });
  });
});

describe('VipUpgradeService', () => {
  let service: VipUpgradeService;
  let repo: jest.Mocked<Repository<VipUpgradeRequest>>;

  const mockRequest: VipUpgradeRequest = {
    id: 'request-1',
    userId: 'user-1',
    paymentMethod: 'BANK_TRANSFER',
    paymentProof: '/proofs/proof-1.pdf',
    status: 'PENDING',
    note: null,
    requestedAt: new Date(),
    reviewedAt: null,
    reviewedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VipUpgradeService,
        { provide: getRepositoryToken(VipUpgradeRequest), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<VipUpgradeService>(VipUpgradeService);
    repo = module.get(getRepositoryToken(VipUpgradeRequest));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated requests', async () => {
      repo.findAndCount.mockResolvedValue([[mockRequest], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockRequest]);
    });

    it('should filter by userId', async () => {
      repo.findAndCount.mockResolvedValue([[mockRequest], 1]);

      await service.findAll({ userId: 'user-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockRequest], 1]);

      await service.findAll({ status: 'PENDING' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return request when found', async () => {
      repo.findOne.mockResolvedValue(mockRequest);

      const result = await service.findById('request-1');

      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('VIP upgrade request not found');
    });
  });

  describe('create', () => {
    it('should create new request with requestedAt', async () => {
      const createDto = { userId: 'user-1', paymentMethod: 'PAYPAL' };
      repo.create.mockReturnValue({ ...mockRequest, ...createDto } as VipUpgradeRequest);
      repo.save.mockResolvedValue({ ...mockRequest, ...createDto } as VipUpgradeRequest);

      const result = await service.create(createDto);

      expect(result.userId).toBe('user-1');
      expect(result.requestedAt).toBeDefined();
    });
  });

  describe('review', () => {
    it('should approve request', async () => {
      repo.findOne.mockResolvedValue(mockRequest);
      repo.save.mockImplementation((e) => Promise.resolve(e as VipUpgradeRequest));

      const result = await service.review('request-1', { status: 'APPROVED', note: 'Approved!' }, 'admin-1');

      expect(result.status).toBe('APPROVED');
      expect(result.note).toBe('Approved!');
      expect(result.reviewedBy).toBe('admin-1');
      expect(result.reviewedAt).toBeDefined();
    });

    it('should reject request', async () => {
      repo.findOne.mockResolvedValue(mockRequest);
      repo.save.mockImplementation((e) => Promise.resolve(e as VipUpgradeRequest));

      const result = await service.review('request-1', { status: 'REJECTED', note: 'Invalid payment' }, 'admin-1');

      expect(result.status).toBe('REJECTED');
    });

    it('should keep existing note when not provided', async () => {
      const withNote = { ...mockRequest, note: 'Original note' };
      repo.findOne.mockResolvedValue(withNote);
      repo.save.mockImplementation((e) => Promise.resolve(e as VipUpgradeRequest));

      const result = await service.review('request-1', { status: 'APPROVED' }, 'admin-1');

      expect(result.note).toBe('Original note');
    });
  });
});

describe('ResourceService', () => {
  let service: ResourceService;
  let repo: jest.Mocked<Repository<Resource>>;
  let subscriptionSvc: jest.Mocked<SubscriptionService>;

  const mockResource: Resource = {
    id: 'resource-1',
    title: 'HSK 1 Vocabulary PDF',
    description: 'Complete vocabulary list',
    tier: ResourceTier.FREE,
    fileKey: '/files/hsk1.pdf',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const mockSubscriptionSvc = {
      checkVipEntitlement: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        { provide: getRepositoryToken(Resource), useValue: mockRepo },
        { provide: SubscriptionService, useValue: mockSubscriptionSvc },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    repo = module.get(getRepositoryToken(Resource));
    subscriptionSvc = module.get(SubscriptionService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      repo.findAndCount.mockResolvedValue([[mockResource], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockResource]);
    });

    it('should filter by tier', async () => {
      repo.findAndCount.mockResolvedValue([[mockResource], 1]);

      await service.findAll({ tier: ResourceTier.FREE });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tier: ResourceTier.FREE }) }),
      );
    });

    it('should mask VIP fileKey for non-entitled user', async () => {
      const vipResource = { ...mockResource, tier: ResourceTier.VIP, fileKey: '/secret/file.pdf' };
      repo.findAndCount.mockResolvedValue([[vipResource], 1]);

      const result = await service.findAll({}, 'user-1', Role.FREE);

      expect(result.data[0]).not.toHaveProperty('fileKey');
    });

    it('should include VIP fileKey for entitled user (VIP subscription)', async () => {
      const vipResource = { ...mockResource, tier: ResourceTier.VIP, fileKey: '/secret/file.pdf' };
      repo.findAndCount.mockResolvedValue([[vipResource], 1]);
      subscriptionSvc.checkVipEntitlement.mockResolvedValue(true);

      const result = await service.findAll({}, 'vip-user', Role.FREE);

      expect(result.data[0]).toHaveProperty('fileKey', '/secret/file.pdf');
    });

    it('should include VIP fileKey for teacher', async () => {
      const vipResource = { ...mockResource, tier: ResourceTier.VIP, fileKey: '/secret/file.pdf' };
      repo.findAndCount.mockResolvedValue([[vipResource], 1]);

      const result = await service.findAll({}, 'teacher-1', Role.TEACHER);

      expect(result.data[0]).toHaveProperty('fileKey');
    });

    it('should include VIP fileKey for admin', async () => {
      const vipResource = { ...mockResource, tier: ResourceTier.VIP, fileKey: '/secret/file.pdf' };
      repo.findAndCount.mockResolvedValue([[vipResource], 1]);

      const result = await service.findAll({}, 'admin-1', Role.ADMIN);

      expect(result.data[0]).toHaveProperty('fileKey');
    });
  });

  describe('findById', () => {
    it('should return resource with masked VIP fileKey', async () => {
      const vipResource = { ...mockResource, tier: ResourceTier.VIP, fileKey: '/secret/file.pdf' };
      repo.findOne.mockResolvedValue(vipResource);

      const result = await service.findById('resource-1', 'user-1', Role.FREE);

      expect(result).not.toHaveProperty('fileKey');
    });
  });

  describe('create', () => {
    it('should create new resource', async () => {
      const createDto = { title: 'New Resource', tier: ResourceTier.FREE, status: 'ACTIVE' as const };
      repo.create.mockReturnValue({ ...mockResource, ...createDto } as Resource);
      repo.save.mockResolvedValue({ ...mockResource, ...createDto } as Resource);

      const result = await service.create(createDto);

      expect(result.title).toBe('New Resource');
    });
  });

  describe('update', () => {
    it('should update resource', async () => {
      repo.findOne.mockResolvedValue(mockResource);
      repo.save.mockImplementation((e) => Promise.resolve(e as Resource));

      const result = await service.update('resource-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('softDelete', () => {
    it('should soft delete resource', async () => {
      repo.findOne.mockResolvedValue(mockResource);
      repo.softRemove.mockResolvedValue(mockResource);

      await service.softDelete('resource-1');

      expect(repo.softRemove).toHaveBeenCalled();
    });
  });
});
