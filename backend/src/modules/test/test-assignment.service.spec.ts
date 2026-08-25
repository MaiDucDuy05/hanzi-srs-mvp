import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestAssignmentService } from './test-assignment.service';
import { TestAssignment } from './entities/test-assignment.entity';
import { Test } from './entities/test.entity';
import { TestStatus } from '../../common/enums/test.enums';

describe('TestAssignmentService', () => {
  let service: TestAssignmentService;
  const repo = {
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
    createQueryBuilder: jest.fn(),
  };
  const testRepo = { update: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        TestAssignmentService,
        { provide: getRepositoryToken(TestAssignment), useValue: repo },
        { provide: getRepositoryToken(Test), useValue: testRepo },
      ],
    }).compile();
    service = mod.get(TestAssignmentService);
    jest.clearAllMocks();
  });

  it('create throws BadRequestException when neither classroomId nor studentIds are given', async () => {
    await expect(
      service.create({ testId: 't1', startTime: '2026-01-01', endTime: '2026-01-02' } as any, 't-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create with classroomId creates one assignment and publishes test', async () => {
    await service.create(
      {
        testId: 't1',
        classroomId: 'c1',
        startTime: '2026-01-01T00:00:00Z',
        endTime: '2026-01-02T00:00:00Z',
      } as any,
      't-1',
    );
    expect(repo.save).toHaveBeenCalled();
    const saved = repo.save.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(saved[0].classroomId).toBe('c1');
    expect(saved[0].studentId).toBeNull();
    expect(testRepo.update).toHaveBeenCalledWith('t1', { status: TestStatus.PUBLISHED });
  });

  it('create with studentIds creates one assignment per student', async () => {
    await service.create(
      {
        testId: 't1',
        studentIds: ['s1', 's2', 's3'],
        startTime: '2026-01-01T00:00:00Z',
        endTime: '2026-01-02T00:00:00Z',
      } as any,
      't-1',
    );
    const saved = repo.save.mock.calls[0][0];
    expect(saved).toHaveLength(3);
    expect(saved.every((s: any) => s.classroomId === null)).toBe(true);
  });

  it('create with both classroomId and studentIds creates both groups', async () => {
    await service.create(
      {
        testId: 't1',
        classroomId: 'c1',
        studentIds: ['s1'],
        startTime: '2026-01-01T00:00:00Z',
        endTime: '2026-01-02T00:00:00Z',
      } as any,
      't-1',
    );
    const saved = repo.save.mock.calls[0][0];
    expect(saved).toHaveLength(2);
  });

  it('create defaults statusOnSubmit to GRADED', async () => {
    await service.create(
      {
        testId: 't1',
        classroomId: 'c1',
        startTime: '2026-01-01T00:00:00Z',
        endTime: '2026-01-02T00:00:00Z',
      } as any,
      't-1',
    );
    const saved = repo.save.mock.calls[0][0][0];
    expect(saved.statusOnSubmit).toBe('GRADED');
  });

  it('findAssignedToStudent uses OR join for direct + classroom', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'a1' }]),
    };
    repo.createQueryBuilder.mockReturnValueOnce(qb);
    const out = await service.findAssignedToStudent('s1', ['c1']);
    expect(out).toHaveLength(1);
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('ta.test', 'test');
    expect(qb.andWhere).toHaveBeenCalledWith(
      'test.hiddenByAdmin = :hiddenByAdmin',
      { hiddenByAdmin: false },
    );
  });

  it('findAssignedToStudent handles empty classroom list with [null] placeholder', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    repo.createQueryBuilder.mockReturnValueOnce(qb);
    await service.findAssignedToStudent('s1', []);
    expect(qb.where).toHaveBeenCalledWith(
      expect.stringContaining('classroomId IN (:...classroomIds)'),
      expect.objectContaining({ classroomIds: [null] }),
    );
  });
});
