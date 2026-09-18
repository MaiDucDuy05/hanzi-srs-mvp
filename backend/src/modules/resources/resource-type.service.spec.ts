import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ResourceTypeService } from './resource-type.service';
import { ResourceType } from './entities/resource-type.entity';

describe('ResourceTypeService', () => {
  let service: ResourceTypeService;
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => Promise.resolve({ id: 'type-1', ...entity })),
    softRemove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceTypeService,
        { provide: getRepositoryToken(ResourceType), useValue: repo },
      ],
    }).compile();

    service = mod.get(ResourceTypeService);
    jest.clearAllMocks();
  });

  it('findAll returns active types by default', async () => {
    repo.find.mockResolvedValue([
      { id: '1', name: 'HSK Standard', code: 'hsk', displayOrder: 1, isActive: true },
    ]);
    const res = await service.findAll(false);
    expect(res).toHaveLength(1);
    expect(repo.find).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  });

  it('findAll includes inactive types when requested', async () => {
    repo.find.mockResolvedValue([
      { id: '1', name: 'HSK', code: 'hsk', displayOrder: 1, isActive: true },
      { id: '2', name: 'Old Type', code: 'old', displayOrder: 2, isActive: false },
    ]);
    const res = await service.findAll(true);
    expect(res).toHaveLength(2);
    expect(repo.find).toHaveBeenCalledWith({
      where: {},
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  });

  it('findById throws NotFoundException if not exists', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById('non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findById returns entity if found', async () => {
    const entity = { id: 'type-1', name: 'Boya', code: 'boya' };
    repo.findOne.mockResolvedValue(entity);
    const res = await service.findById('type-1');
    expect(res).toBe(entity);
  });

  it('create throws ConflictException if code exists', async () => {
    repo.findOne.mockResolvedValue({ id: 'existing', code: 'boya' });
    await expect(
      service.create({ name: 'Boya 2', code: 'boya' }),
    ).rejects.toThrow(ConflictException);
  });

  it('create saves new resource type', async () => {
    repo.findOne.mockResolvedValue(null);
    const dto = { name: 'HSK Standard', code: 'hsk_standard', displayOrder: 1 };
    const res = await service.create(dto);
    expect(res.name).toBe('HSK Standard');
    expect(repo.save).toHaveBeenCalled();
  });

  it('update throws ConflictException if updated code belongs to another type', async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 'type-1', code: 'code1' }) // findById
      .mockResolvedValueOnce({ id: 'type-2', code: 'code2' }); // code check
    await expect(
      service.update('type-1', { code: 'code2' }),
    ).rejects.toThrow(ConflictException);
  });

  it('update updates and returns entity', async () => {
    const entity = { id: 'type-1', name: 'Old Name', code: 'code1' };
    repo.findOne.mockResolvedValue(entity);
    const res = await service.update('type-1', { name: 'New Name' });
    expect(res.name).toBe('New Name');
    expect(repo.save).toHaveBeenCalled();
  });

  it('softDelete soft-removes entity', async () => {
    const entity = { id: 'type-1', name: 'Delete me' };
    repo.findOne.mockResolvedValue(entity);
    await service.softDelete('type-1');
    expect(repo.softRemove).toHaveBeenCalledWith(entity);
  });
});
