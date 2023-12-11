import { UserTokenGuard } from '../user-token/user-token.guard';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

describe('UserTokenGuard', () => {
  let guard: UserTokenGuard;
  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserTokenGuard,
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

    guard = module.get<UserTokenGuard>(UserTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
