import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ClientTokenGuard } from '../client-token/client-token.guard';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

describe('ClientTokenGuard', () => {
  let guard: ClientTokenGuard;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ClientTokenGuard,
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

    guard = module.get<ClientTokenGuard>(ClientTokenGuard);
  })

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
