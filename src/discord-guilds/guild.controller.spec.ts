import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { GuildController } from './guild.controller';
import { GuildsService } from './guilds.service';
import PostGuildRequestDto from './dto/guild-post-request.dto';

jest.mock('@nestjs/cache-manager', () => ({
  CacheInterceptor: jest.fn().mockImplementation(() => ({})),
}));

describe('GuildsController', () => {
  let controller: GuildController;

  const mockService = {
    get: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildController],
      providers: [{ provide: GuildsService, useValue: mockService }],
    }).compile();

    controller = module.get<GuildController>(GuildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call get', async () => {
    await controller.get('850840267082563596');
    expect(mockService.get).toBeCalledWith('850840267082563596');
  });

  it('should call create', async () => {
    const postGuildRequestDto: PostGuildRequestDto = {
      guildName: 'Test Guild',
      poapManagerRoleId: '1130525129131167786',
      privateChannelId: '1100470846490951790',
      newsChannelId: '1130525131937161286',
    };
    await controller.create('850840267082563596', postGuildRequestDto);
    expect(mockService.create).toBeCalledWith(
      '850840267082563596',
      postGuildRequestDto,
    );
  });

  it('should call create without newsChannelId', async () => {
    const postGuildRequestDto: PostGuildRequestDto = {
      guildName: 'Test Guild',
      poapManagerRoleId: '1130525129131167786',
      privateChannelId: '1100470846490951790',
    };
    await controller.create('850840267082563596', postGuildRequestDto);
    expect(mockService.create).toBeCalledWith(
      '850840267082563596',
      postGuildRequestDto,
    );
  });

  it('should call remove', async () => {
    await controller.remove('850840267082563596');
    expect(mockService.remove).toBeCalledWith('850840267082563596');
  });
});
