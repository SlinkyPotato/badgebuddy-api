import { Test, TestingModule } from '@nestjs/testing';
import { DiscordActiveCommunityEventsService } from './discord-active-community-events.service';
import { describe, beforeEach, it, expect } from '@jest/globals';

describe('ActiveCommunityEventsServiceService', () => {
  let service: DiscordActiveCommunityEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordActiveCommunityEventsService],
    }).compile();

    service = module.get<DiscordActiveCommunityEventsService>(DiscordActiveCommunityEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
