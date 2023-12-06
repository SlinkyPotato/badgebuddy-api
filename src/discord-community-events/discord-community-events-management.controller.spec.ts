import { Test, TestingModule } from '@nestjs/testing';
import { DiscordCommunityEventsManagementController } from './discord-community-events-management.controller';
import { describe, beforeEach, it, expect } from '@jest/globals';

describe('DiscordCommunityEventsManagementController', () => {
  let controller: DiscordCommunityEventsManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordCommunityEventsManagementController],
    }).compile();

    controller = module.get<DiscordCommunityEventsManagementController>(DiscordCommunityEventsManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
