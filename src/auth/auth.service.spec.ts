import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { afterEach } from 'node:test';

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockReturnValue({
        messageId: '123456789',
      }),
    }),
  };
});

describe('AuthService', () => {
  let service: AuthService;

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnThis(),
  };

  const mockCacheManager = {
    del: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };

  const mockTokenEntityRepository = {
    findOne: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockReturnThis(),
    sign: jest.fn().mockReturnThis(),
    verifyAsync: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: Logger, useValue: mockLogger },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: jest.fn() },
        { provide: HttpService, useValue: jest.fn() },
        { provide: 'TokenEntityRepository', useValue: mockTokenEntityRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authorize', () => {
    
    it('should generate an auth code', async () => {
      mockJwtService.sign.mockReturnValue('testJWTValue');
      const state = crypto.randomUUID();
      const result = await service.authorize({
        clientId: 'testClient',
        codeChallenge: 'testCodeChallenge',
        codeChallengeMethod: 's256',
        state
      });
      expect(result.code.length).toEqual(40);
      expect(result.state).toEqual(state);
    });
  });
});
