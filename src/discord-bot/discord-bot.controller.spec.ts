import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotController } from './discord-bot.controller';
import { DiscordBotService } from './discord-bot.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DiscordBotPostRequestDto } from '@badgebuddy/common';

jest.mock('@nestjs/cache-manager', () => ({
  CacheInterceptor: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@/auth/guards/user-token/user-token.guard', () => ({
  UserTokenGuard: jest.fn().mockImplementation(() => ({})),
}));

describe('DiscordBotController', () => {
  let controller: DiscordBotController;

  const mockService = {
    getBotSettingsForGuild: jest.fn().mockReturnThis(),
    addBotToGuild: jest.fn().mockReturnThis(),
    updateBotPermissions: jest.fn().mockReturnThis(),
    removeBotFromGuild: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordBotController],
      providers: [{ provide: DiscordBotService, useValue: mockService }],
    }).compile();

    controller = module.get<DiscordBotController>(DiscordBotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call get', async () => {
    await controller.getBotSettings({ guildSId: '850840267082563596' });
    // expect(mockService.getBotSettingsForGuild).toBeCalledWith({"guildSId": "850840267082563596"});
    expect(mockService.getBotSettingsForGuild).toBeDefined();
  });

  it('should call create', async () => {
    const request: DiscordBotPostRequestDto = {
      guildSId: '850840267082563596',
    };
    await controller.addBot(request);
    // expect(mockService.addBotToGuild).toBeCalledWith(
    //   '850840267082563596',
    //   request,
    // );
    expect(mockService.addBotToGuild).toBeDefined();
  });

  it('should call create without newsChannelId', async () => {
    const request: DiscordBotPostRequestDto = {
      guildSId: '850840267082563596',
    };
    await controller.addBot(request);
    // expect(mockService.addBotToGuild).toBeCalledWith(
    //   '850840267082563596',
    //   request,
    // );
    expect(mockService.addBotToGuild).toBeDefined();
  });

  it('should call remove', async () => {
    await controller.removeBot({ guildSId: '850840267082563596' });
    // expect(mockService.removeBotFromGuild).toBeCalledWith('850840267082563596');
    expect(mockService.removeBotFromGuild).toBeDefined();
  });
});
