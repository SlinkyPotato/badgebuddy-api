import { Test, TestingModule } from '@nestjs/testing';
import { DiscordActiveCommunityEventsService } from './discord-active-community-events.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('ActiveCommunityEventsServiceService', () => {
  let service: DiscordActiveCommunityEventsService;

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordActiveCommunityEventsService,
        { provide: Logger, useValue: mockLogger },
        { provide: 'CommunityEventDiscordEntityRepository', useValue: jest.fn() },
        { provide: ConfigService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<DiscordActiveCommunityEventsService>(DiscordActiveCommunityEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
