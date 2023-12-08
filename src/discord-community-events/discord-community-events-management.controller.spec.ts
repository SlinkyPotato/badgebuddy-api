import { Test, TestingModule } from '@nestjs/testing';
import { DiscordCommunityEventsManagementController } from './discord-community-events-management.controller';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import {
  DiscordCommunityEventsManagementService
} from './discord-community-events-management.service';
import { PoapManagerGuard } from './guards/poap-manager.guard';
import { Logger } from '@nestjs/common';

describe('DiscordCommunityEventsManagementController', () => {
  let controller: DiscordCommunityEventsManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordCommunityEventsManagementController],
      providers: [
        { provide: PoapManagerGuard, useValue: jest.fn() },
        { provide: DiscordCommunityEventsManagementService, useValue: jest.fn() },
        { provide: 'CACHE_MANAGER', useValue: jest.fn() },
        { provide: '__inject_discord_client__', useValue: jest.fn() },
        { provide: Logger, useValue: jest.fn() },
        { provide: 'DiscordBotSettingsEntityRepository', useValue: jest.fn() },
      ]
    }).compile();

    controller = module.get<DiscordCommunityEventsManagementController>(DiscordCommunityEventsManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
