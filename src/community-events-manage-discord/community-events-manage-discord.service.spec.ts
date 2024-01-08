import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { CommunityEventsManageDiscordService } from './community-events-manage-discord.service';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { from } from 'rxjs';
import { PoapsService } from '@/poaps/poaps.service';

describe('DiscordCommunityEventsManageService', () => {
  let service: CommunityEventsManageDiscordService;

  const mockHttpService = {
    get: jest.fn().mockImplementation(() => {
      return from(
        Promise.resolve({
          data: 'http://POAP.xyz/claim/ndt7p6\nhttp://POAP.xyz/claim/a13elq\nhttp://POAP.xyz/claim/by2eqg\nhttp://POAP.xyz/claim/evodx7\nhttp://POAP.xyz/claim/tnc8yg\n',
        }),
      );
    }),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockPoapService = {
    parsePoapLinksUrl: jest.fn(),
    insertPoapClaimsToDb: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityEventsManageDiscordService,
        { provide: Logger, useValue: mockLogger },
        {
          provide: 'CommunityEventDiscordEntityRepository',
          useValue: jest.fn(),
        },
        { provide: 'DiscordUserEntityRepository', useValue: jest.fn() },
        { provide: 'DiscordBotSettingsEntityRepository', useValue: jest.fn() },
        { provide: 'CACHE_MANAGER', useValue: jest.fn() },
        {
          provide: 'BullQueue_DISCORD_COMMUNITY_EVENTS_QUEUE',
          useValue: jest.fn(),
        },
        { provide: '__inject_discord_client__', useValue: jest.fn() },
        { provide: HttpService, useValue: mockHttpService },
        { provide: DataSource, useValue: jest.fn() },
        { provide: PoapsService, useValue: mockPoapService },
      ],
    }).compile();

    service = module.get<CommunityEventsManageDiscordService>(
      CommunityEventsManageDiscordService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
