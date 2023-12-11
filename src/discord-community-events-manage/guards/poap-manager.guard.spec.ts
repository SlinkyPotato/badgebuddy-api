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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoapManagerGuard,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: '__inject_discord_client__', useValue: mockDiscordClient },
        { provide: Logger, useValue: mockLogger },
        { provide: 'DiscordBotSettingsEntityRepository', useValue: jest.fn() }
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
