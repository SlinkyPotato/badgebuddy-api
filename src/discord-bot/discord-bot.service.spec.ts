import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotService } from './discord-bot.service';
import { describe, it, jest, beforeEach, expect } from '@jest/globals';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service';

describe('DiscordBotService', () => {
  let service: DiscordBotService;

  const mockCacheManager = {
    get: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
  };

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordBotService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: Logger, useValue: mockLogger },
        { provide: 'DiscordBotSettingsEntityRepository', useValue: jest.fn() },
        { provide: 'TokenEntityRepository', useValue: jest.fn() },
        { provide: '__inject_discord_client__', useValue: jest.fn() },
        { provide: ConfigService, useValue: jest.fn() },
        { provide: AuthService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<DiscordBotService>(DiscordBotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toHaveProperty('getBotSettingsForGuild');
    expect(service).toHaveProperty('addBotToGuild');
    expect(service).toHaveProperty('updateBotPermissions');
    expect(service).toHaveProperty('removeBotFromGuild');
  });
});
