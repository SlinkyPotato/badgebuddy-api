import { Test, TestingModule } from '@nestjs/testing';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import PostGuildRequestDto from './dto/post/guild.request.dto';

describe('GuildsController', () => {
  let controller: GuildsController;

  const mockService = {
    get: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildsController],
      providers: [
        { provide: GuildsService, useValue: mockService },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<GuildsController>(GuildsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call get', async () => {
    await controller.get('id');
    expect(mockService.get).toBeCalledWith('id');
  });

  it('should call create', async () => {
    const postGuildRequestDto: PostGuildRequestDto = {
      guildName: 'Test Guild',
      poapManagerRoleId: '1130525129131167786',
      privateChannelId: '1100470846490951790',
      newsChannelId: '1130525131937161286',
    };
    await controller.create('850840267082563596', postGuildRequestDto);
    expect(mockService.create).toBeCalledWith('id', postGuildRequestDto);
  });

  it('should call create without newsChannelId', async () => {
    const postGuildRequestDto: PostGuildRequestDto = {
      guildName: 'Test Guild',
      poapManagerRoleId: '1130525129131167786',
      privateChannelId: '1100470846490951790',
    };
    await controller.create('850840267082563596', postGuildRequestDto);
    expect(mockService.create).toBeCalledWith('id', postGuildRequestDto);
  });
});
