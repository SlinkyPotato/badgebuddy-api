import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommunityEventsActiveDiscordService } from './community-events-active-discord.service';

describe('ActiveCommunityEventsServiceService', () => {
  let service: CommunityEventsActiveDiscordService;

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityEventsActiveDiscordService,
        { provide: Logger, useValue: mockLogger },
        {
          provide: 'CommunityEventDiscordEntityRepository',
          useValue: jest.fn(),
        },
        { provide: ConfigService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<CommunityEventsActiveDiscordService>(
      CommunityEventsActiveDiscordService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
