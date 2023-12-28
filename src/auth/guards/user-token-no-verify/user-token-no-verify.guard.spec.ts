import { UserTokenNoVerifyGuard } from './user-token-guard-no-verify.guard';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

describe('UserTokenNoVerifyGuard', () => {
  let guard: UserTokenNoVerifyGuard;
  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserTokenNoVerifyGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    guard = module.get<UserTokenNoVerifyGuard>(UserTokenNoVerifyGuard);
  });
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
