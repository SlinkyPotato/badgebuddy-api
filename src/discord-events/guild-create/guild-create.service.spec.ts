import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GuildsService } from '../../api/guilds/guilds.service';
import { ConfigService } from '@nestjs/config';
import { GuildCreateService } from './guild-create.service';

describe('GuildCreateService', () => {
  let service: GuildCreateService;

  const mockLogger = {
    log: jest.fn(),
  };

  const mockGuildsApiService = {
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        GuildCreateService,
        { provide: Logger, useValue: mockLogger },
        { provide: GuildsService, useValue: mockGuildsApiService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = testModule.get(GuildCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
