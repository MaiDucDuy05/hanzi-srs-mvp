import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Role, UserStatus } from '../../common/enums/user.enums';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    fullName: 'Test User',
    role: Role.FREE,
    status: UserStatus.ACTIVE,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      recover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users with default options', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockUser]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should filter by role', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({ role: Role.TEACHER });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: Role.TEACHER },
        }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({ status: UserStatus.ACTIVE });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: UserStatus.ACTIVE },
        }),
      );
    });

    it('should search by email with ILike', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({ search: 'test' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            expect.objectContaining({ email: expect.anything() }),
            expect.objectContaining({ fullName: expect.anything() }),
          ]),
        }),
      );
    });

    it('should handle custom pagination', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 3, limit: 10 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should sort by createdAt DESC by default', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
        }),
      );
    });

    it('should handle custom sort parameters', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ sortBy: 'email', sortOrder: 'ASC' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { email: 'ASC' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const createDto = { email: 'new@example.com', password: 'password123', fullName: 'New User' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ ...mockUser, ...createDto, passwordHash: 'hashedPassword' } as User);
      repo.save.mockResolvedValue({ ...mockUser, ...createDto, passwordHash: 'hashedPassword' } as User);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(result.passwordHash).toBe('hashedPassword');
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      await expect(service.create({ email: 'test@example.com', password: '123456', fullName: 'Test' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const updateDto = { fullName: 'Updated Name' };
      repo.findOne.mockImplementation(async (opts: any) => {
        if (opts?.where?.id === 'user-1') return mockUser;
        if (opts?.where?.email === 'new@example.com') return null;
        return null;
      });
      repo.save.mockImplementation((entity) => Promise.resolve(entity as User));

      const result = await service.update('user-1', updateDto);

      expect(result.fullName).toBe(updateDto.fullName);
    });

    it('should hash password when updating password', async () => {
      const updateDto = { password: 'newPassword123' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      repo.findOne.mockImplementation(async (opts: any) => {
        if (opts?.where?.id === 'user-1') return mockUser;
        return null;
      });
      repo.save.mockImplementation((entity) => Promise.resolve(entity as User));

      await service.update('user-1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('should throw ConflictException when changing to existing email', async () => {
      const existingEmailUser = { ...mockUser, email: 'existing@example.com' };
      repo.findOne.mockImplementation(async (opts: any) => {
        if (opts?.where?.id === 'user-1') return mockUser;
        if (opts?.where?.email === 'existing@example.com') return existingEmailUser;
        return null;
      });

      await expect(service.update('user-1', { email: 'existing@example.com' })).rejects.toThrow(ConflictException);
    });

    it('should not throw when keeping same email', async () => {
      repo.findOne.mockImplementation(async (opts: any) => {
        if (opts?.where?.id === 'user-1') return mockUser;
        return null;
      });
      repo.save.mockImplementation((entity) => Promise.resolve(entity as User));

      await expect(service.update('user-1', { email: mockUser.email, fullName: 'New Name' })).resolves.toBeDefined();
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      repo.softRemove.mockResolvedValue(mockUser);

      await service.softDelete('user-1');

      expect(repo.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted user', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      repo.recover.mockResolvedValue(deletedUser);
      repo.findOne.mockResolvedValue({ ...mockUser, deletedAt: null });

      const result = await service.restore('user-1');

      expect(repo.recover).toHaveBeenCalledWith({ id: 'user-1' } as User);
    });
  });
});
