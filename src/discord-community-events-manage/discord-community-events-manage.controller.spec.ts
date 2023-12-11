import { Test, TestingModule } from '@nestjs/testing';
import { DiscordCommunityEventsManageController } from './discord-community-events-manage.controller';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import {
  DiscordCommunityEventsManageService
} from './discord-community-events-manage.service';
import { PoapManagerGuard } from './guards/poap-manager.guard';
import { Logger } from '@nestjs/common';

describe('DiscordCommunityEventsManageController', () => {
  let controller: DiscordCommunityEventsManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordCommunityEventsManageController],
      providers: [
        { provide: PoapManagerGuard, useValue: jest.fn() },
        { provide: DiscordCommunityEventsManageService, useValue: jest.fn() },
        { provide: 'CACHE_MANAGER', useValue: jest.fn() },
        { provide: '__inject_discord_client__', useValue: jest.fn() },
        { provide: Logger, useValue: jest.fn() },
        { provide: 'DiscordBotSettingsEntityRepository', useValue: jest.fn() },
      ]
    }).compile();

    controller = module.get<DiscordCommunityEventsManageController>(DiscordCommunityEventsManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
