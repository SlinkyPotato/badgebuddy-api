import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotController } from './discord-bot.controller';
import { DiscordBotService } from './discord-bot.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DiscordBotPostRequestDto } from './dto/discord-bot-post-request.dto';

jest.mock('@nestjs/cache-manager', () => ({
  CacheInterceptor: jest.fn().mockImplementation(() => ({})),
}));

describe('DiscordBotController', () => {
  let controller: DiscordBotController;

  const mockService = {
    get: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
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
    expect(mockService.get).toBeCalledWith('850840267082563596');
  });

  it('should call create', async () => {
    const request: DiscordBotPostRequestDto = {
      guildSId: '850840267082563596',
      poapManagerRoleId: '1130525129131167786',
      privateChannelId: '1100470846490951790',
      newsChannelId: '1130525131937161286',
    };
    await controller.addBot(request);
    expect(mockService.create).toBeCalledWith(
      '850840267082563596',
      request,
    );
  });

  it('should call create without newsChannelId', async () => {
    const request: DiscordBotPostRequestDto = {
      guildSId: '850840267082563596',
      poapManagerRoleId: '1130525129131167786',
      privateChannelId: '1100470846490951790',
    };
    await controller.addBot(request);
    expect(mockService.create).toBeCalledWith(
      '850840267082563596',
      request,
    );
  });

  it('should call remove', async () => {
    await controller.removeBot({ guildSId: '850840267082563596' });
    expect(mockService.remove).toBeCalledWith('850840267082563596');
  });
});
