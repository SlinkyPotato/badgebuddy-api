import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GuildsService } from '../../api/guilds/guilds.service';
import { ConfigService } from '@nestjs/config';
import { GuildCreateService } from './guild-create.service';
import { ChannelType } from 'discord.js';
import PostGuildResponseDto from '../../api/guilds/dto/post/guild.response.dto';

describe('GuildCreateService', () => {
  let service: GuildCreateService;

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
  };

  const mockGuildsApiService = {
    create: jest.fn().mockReturnThis(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        GuildCreateService,
        { provide: Logger, useValue: mockLogger },
        { provide: GuildsService, useValue: mockGuildsApiService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = testModule.get(GuildCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should setup a guild', async () => {
    const mockRole = {
      id: '1130525129131167786',
      name: 'POAP Managers',
      color: 'DarkGreen',
    };
    const mockGuildMember = {
      id: '159014522542096384',
      name: 'POAP Managers',
      roles: {
        add: jest.fn().mockReturnValue(Promise.resolve(null)),
      },
    };
    const mockTextChannel = {
      id: '1100470846490951790',
      name: 'test-private-channel',
      type: ChannelType.GuildText,
      send: jest.fn().mockReturnValue(Promise.resolve(null)),
    };
    const mockNewsChannel = {
      id: '1130525131937161286',
      name: 'test-news-channel',
      type: ChannelType.GuildNews,
      send: jest.fn().mockReturnValue(Promise.resolve(null)),
    };
    const mockGuild = {
      id: '850840267082563596',
      name: 'test-guild',
      features: ['COMMUNITY'],
      available: true,
      members: {
        fetch: jest.fn().mockReturnValue(Promise.resolve(mockGuildMember)),
      },
      channels: {
        create: jest.fn().mockReturnThis(),
      },
      roles: {
        create: jest.fn().mockReturnValue(Promise.resolve(mockRole)),
        everyone: jest.fn().mockReturnThis(),
      },
    };

    mockGuild.channels.create.mockReturnValueOnce(
      Promise.resolve(mockTextChannel),
    );

    mockGuild.channels.create.mockReturnValueOnce(
      Promise.resolve(mockNewsChannel),
    );

    const mockGuildResponse: PostGuildResponseDto = {
      _id: '850840267082563596',
    };

    mockGuildsApiService.create.mockReturnValue(
      Promise.resolve(mockGuildResponse),
    );
    const result = await service.setupGuild(mockGuild as any);
    expect(result).toEqual(mockGuildResponse);
  });

  it('should throw for creating poap manager role', async () => {
    const mockDiscordAssignRoleError = new Error('assign role error');
    const mockGuild = {
      id: '850840267082563596',
      name: 'test-guild',
      available: true,
      roles: {
        create: jest
          .fn()
          .mockReturnValue(Promise.reject(mockDiscordAssignRoleError)),
      },
    };

    const mockGuildResponse: PostGuildResponseDto = {
      _id: '850840267082563596',
    };

    mockGuildsApiService.create.mockReturnValue(
      Promise.resolve(mockGuildResponse),
    );
    try {
      await service.setupGuild(mockGuild as any);
    } catch (err) {
      expect(err).toEqual(mockDiscordAssignRoleError);
    }
  });

  it('should throw for assigning role to bot', async () => {
    const mockRole = {
      id: '1130525129131167786',
      name: 'POAP Managers',
      color: 'DarkGreen',
    };
    const mockGuildMember = {
      id: '159014522542096384',
      name: 'Test Guild Member',
      roles: {
        add: jest
          .fn()
          .mockReturnValue(Promise.reject(new Error('assign role error'))),
      },
    };
    const mockGuild = {
      id: '850840267082563596',
      name: 'test-guild',
      available: true,
      members: {
        fetch: jest.fn().mockReturnValue(Promise.resolve(mockGuildMember)),
      },
      roles: {
        create: jest.fn().mockReturnValue(Promise.resolve(mockRole)),
      },
    };

    const mockGuildResponse: PostGuildResponseDto = {
      _id: '850840267082563596',
    };

    mockGuildsApiService.create.mockReturnValue(
      Promise.resolve(mockGuildResponse),
    );
    const mockDiscordAssignRoleError = new Error(
      `failed to assign role to bot, guildId: ${mockGuild.id}, guildName: ${mockGuild.name}`,
    );
    try {
      await service.setupGuild(mockGuild as any);
    } catch (err) {
      expect(err).toEqual(mockDiscordAssignRoleError);
    }
  });
});
