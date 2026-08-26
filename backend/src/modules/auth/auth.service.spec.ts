import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  const userRepo: any = {
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
    createQueryBuilder: jest.fn(),
  };
  const subRepo = { findOne: jest.fn() };
  const jwt: any = {
    sign: jest.fn().mockReturnValue('jwt-token'),
    decode: jest.fn().mockReturnValue({ exp: 1234567890 }),
  };
  const cache: any = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };
  const mail = {
    sendRegistrationOtp: jest.fn().mockResolvedValue(undefined),
    sendForgotPasswordOtp: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: JwtService, useValue: jwt },
        { provide: 'CACHE_MANAGER', useValue: cache },
        { provide: MailService, useValue: mail },
      ],
    }).compile();
    service = mod.get(AuthService);
    jest.resetAllMocks();
    jwt.sign.mockReturnValue('jwt-token');
    jwt.decode.mockReturnValue({ exp: 1234567890 });
  });

  describe('requestRegisterOtp', () => {
    it('throws ConflictException when email exists', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
      await expect(
        service.requestRegisterOtp({ email: 'a@b.c', password: 'p', fullName: 'A' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes password and stores otp in cache for new email', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
      await service.requestRegisterOtp({ email: 'a@b.c', password: 'p', fullName: 'A' } as any);
      expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
      expect(cache.set).toHaveBeenCalledWith(
        'register_otp:a@b.c',
        expect.objectContaining({ passwordHash: 'hash', otp: expect.any(String) }),
        300000,
      );
      expect(mail.sendRegistrationOtp).toHaveBeenCalled();
    });
  });

  describe('verifyRegisterOtp', () => {
    it('throws BadRequestException when cache miss', async () => {
      cache.get.mockResolvedValueOnce(null);
      await expect(service.verifyRegisterOtp('a@b.c', '123456')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws BadRequestException when otp mismatches', async () => {
      cache.get.mockResolvedValueOnce({ email: 'a@b.c', passwordHash: 'h', otp: '111111', fullName: 'A' });
      await expect(service.verifyRegisterOtp('a@b.c', '222222')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('creates user, returns JWT, clears cache on success', async () => {
      cache.get.mockResolvedValueOnce({ email: 'a@b.c', passwordHash: 'h', otp: '111111', fullName: 'A' });
      userRepo.findOne.mockResolvedValueOnce(null);
      userRepo.save.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
      const out = await service.verifyRegisterOtp('a@b.c', '111111');
      expect(jwt.sign).toHaveBeenCalled();
      expect(out.accessToken).toBe('jwt-token');
      expect(out.user.email).toBe('a@b.c');
      expect(cache.del).toHaveBeenCalledWith('register_otp:a@b.c');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      userRepo.createQueryBuilder.mockReturnValueOnce(qb);
      await expect(service.login({ email: 'a@b.c', password: 'p' } as any)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password mismatches', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.c', passwordHash: 'h', status: 'ACTIVE' }),
      };
      userRepo.createQueryBuilder.mockReturnValueOnce(qb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'a@b.c', password: 'p' } as any)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns JWT on valid credentials', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.c', passwordHash: 'h', status: 'ACTIVE' }),
      };
      userRepo.createQueryBuilder.mockReturnValueOnce(qb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const out = await service.login({ email: 'a@b.c', password: 'p' } as any);
      expect(out.accessToken).toBe('jwt-token');
      expect(out.user.email).toBe('a@b.c');
    });
  });

  describe('sanitizeUser', () => {
    it('removes passwordHash from returned object', () => {
      const user: any = { id: 'u1', email: 'a@b.c', passwordHash: 'secret', fullName: 'A' };
      const out: any = (service as any).sanitizeUser(user);
      expect(out.passwordHash).toBeUndefined();
      expect(out.email).toBe('a@b.c');
    });
  });

  describe('validateUser', () => {
    it('returns the user record when found', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1' });
      expect((await service.validateUser('u1'))?.id).toBe('u1');
    });

    it('returns null when user not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      expect(await service.validateUser('missing')).toBeNull();
    });
  });

  describe('forgot password flow', () => {
    it('requestForgotPasswordOtp throws when no user with that email', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.requestForgotPasswordOtp('a@b.c')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('requestForgotPasswordOtp caches reset otp and sends email', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
      await service.requestForgotPasswordOtp('a@b.c');
      expect(cache.set).toHaveBeenCalledWith(
        'forgot_pwd_otp:a@b.c',
        expect.objectContaining({ otp: expect.any(String) }),
        300000,
      );
      expect(mail.sendForgotPasswordOtp).toHaveBeenCalled();
    });

    it('verifyForgotPasswordOtp rejects when otp mismatches', async () => {
      cache.get.mockResolvedValueOnce({ otp: '111111' });
      await expect(service.verifyForgotPasswordOtp('a@b.c', '999999')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
