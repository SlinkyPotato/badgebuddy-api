import { Test, TestingModule } from '@nestjs/testing';
import { GuildsService } from './guilds.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { DiscordGuild } from '@solidchain/badge-buddy-common';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('RegistrationService', () => {
  let service: GuildsService;

  const mockModel = {
    create: jest.fn().mockReturnThis(),
  };

  const mockCacheManager = {
    get: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    // https://docs.nestjs.com/techniques/mongodb#testing
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildsService,
        { provide: getModelToken(DiscordGuild.name), useValue: mockModel },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        Logger,
      ],
    }).compile();

    service = module.get<GuildsService>(GuildsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
