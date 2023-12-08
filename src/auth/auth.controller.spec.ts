import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { AuthService } from './auth.service';
import { ClientIdGuard } from './guards/client-id.guard';
import { EmailCodePipe } from './pipes/email-code.pipe';
import { ClientTokenGuard } from './guards/client-token.guard';
import { ConfigService } from '@nestjs/config';
import {
  UserTokenNoVerifyGuard
} from './guards/user-token-guard-no-verify.guard';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    authorize: jest.fn(),
    authorizeEmail: jest.fn(),
    authorizeGoogle: jest.fn(),
    authorizeDiscord: jest.fn(),
    generateClientToken: jest.fn(),
    refreshAccessToken: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    loginEmail: jest.fn(),
    loginGoogle: jest.fn(),
    loginDiscord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ClientIdGuard,
          useValue: jest.fn(),
        },
        {
          provide: EmailCodePipe,
          useValue: jest.fn(),
        },
        {
          provide: ClientTokenGuard,
          useValue: jest.fn(),
        },
        {
          provide: ConfigService,
          useValue: jest.fn(),
        },
        {
          provide: UserTokenNoVerifyGuard,
          useValue: jest.fn(),
        },
        {
          provide: Logger,
          useValue: jest.fn(),
        },
        {
          provide: JwtService,
          useValue: jest.fn(),
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
