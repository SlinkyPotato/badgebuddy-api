import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AccessTokenGuard } from './access-token.guard';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<AccessTokenGuard>(AccessTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
