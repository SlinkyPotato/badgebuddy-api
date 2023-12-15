import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from '@jest/globals';
import { PoapManagerGuard } from './poap-manager.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProcessorTokenGuard } from '@/auth/guards/processor-token/processor-token.guard';
import { UserTokenGuard } from '@/auth/guards/user-token/user-token.guard';
import { DiscordBotTokenGuard } from '@/auth/guards/discord-bot-token/discord-bot-token.guard';
import { DataSource } from 'typeorm';

describe('PoapManagerGuard', () => {
  let guard: PoapManagerGuard;

  const mockCacheManager = {
    get: jest.fn().mockReturnThis(),
  };

  const mockDiscordClient = {
    guilds: {
      fetch: jest.fn().mockReturnThis(),
    },
  };

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
  };

  const mockJwtService = {
    decode: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoapManagerGuard,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: '__inject_discord_client__', useValue: mockDiscordClient },
        { provide: Logger, useValue: mockLogger },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ProcessorTokenGuard, useValue: jest.fn() },
        { provide: UserTokenGuard, useValue: jest.fn() },
        { provide: DiscordBotTokenGuard, useValue: jest.fn() },
        { provide: DataSource, useValue: jest.fn() },
      ],
    }).compile();
    guard = module.get<PoapManagerGuard>(PoapManagerGuard);

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(PoapManagerGuard);
    expect(guard.canActivate).toBeDefined();
  });

});
