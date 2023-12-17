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
      sendMail: jest.fn().mockReturnValue(
        Promise.resolve({
          messageId: 'testMessageId',
        })
      ),
    }),
  };
});

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateCodeVerifierAsync: jest.fn().mockReturnValue(Promise.resolve({
      codeVerifier: 'testCodeVerifier',
      codeChallenge: 'testCodeChallenge',
    })),
    generateAuthUrl: jest.fn().mockReturnValue('testAuthUrl'),
    getToken: jest.fn(),
  })),
  CodeChallengeMethod: {
    Plain: 'plain',
    S256: 's256',
  }
}));

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
    del: jest.fn().mockReturnValue(Promise.resolve()),
    set: jest.fn().mockReturnValue(Promise.resolve()),
  };

  const mockTokenEntityRepository = {
    findOne: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockReturnThis(),
    sign: jest.fn().mockReturnThis(),
    verifyAsync: jest.fn().mockReturnThis(),
    decode: jest.fn().mockReturnValue({
      sessionId: 'testSessionId',
    })
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

    it('should mock sending email', async () => {
      const result = await service.authorizeEmail({
        email: 'test@email.com',
        state: 'register'
      });
      expect(result).toEqual({state: 'register'});
    });

    it('should authorize google for new register', async () => {
      const clientToken = process.env.TEST_CLIENT_TOKEN ?? '';
      const {authorizeUrl} = await service.authorizeGoogle(
        clientToken,
        'register'
      );
      expect(authorizeUrl).toEqual('testAuthUrl');
    });

    it('should authorize google for login', async () => {
      const clientToken = process.env.TEST_CLIENT_TOKEN ?? '';
      const {authorizeUrl} = await service.authorizeGoogle(
        clientToken,
        'login',
      );
      expect(authorizeUrl).toEqual('testAuthUrl');
    });

  });
});
