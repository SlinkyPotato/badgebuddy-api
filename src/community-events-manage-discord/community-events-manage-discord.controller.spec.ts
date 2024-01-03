import { Test, TestingModule } from '@nestjs/testing';
import { CommunityEventsManageDiscordController } from './community-events-manage-discord.controller';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { CommunityEventsManageDiscordService } from './community-events-manage-discord.service';

jest.mock('./guards/poap-manager.guard', () => {
  return {
    PoapManagerGuard: {
      canActivate: jest.fn(() => true),
    },
  };
});

describe('DiscordCommunityEventsManageController', () => {
  let controller: CommunityEventsManageDiscordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityEventsManageDiscordController],
      providers: [
        { provide: CommunityEventsManageDiscordService, useValue: jest.fn() },
        { provide: 'CACHE_MANAGER', useValue: jest.fn() },
        { provide: '__inject_discord_client__', useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<CommunityEventsManageDiscordController>(
      CommunityEventsManageDiscordController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
