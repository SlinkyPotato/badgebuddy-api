import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from '@jest/globals';
import { AuthGuard } from './auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscordGuild } from '@solidchain/badge-buddy-common';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import GetGuildResponseDto from '../../guilds/dto/get/guild.response.dto';

describe('AuthGuard', () => {
  let service: AuthGuard;
  let mockExecutionContext: any;

  let spyLoggerError: jest.Spied<any>;
  let spyLoggerVerbose: jest.Spied<any>;
  let spyCacheManagerGet: jest.Spied<any>;
  let spyGuildModelFindOne: jest.Spied<any>;
  let spyDiscordClientGuildsFetch: jest.Spied<any>;

  const mockCacheManager = {
    get: jest.fn().mockReturnThis(),
  };

  const mockGuildModel = {
    findOne: jest.fn().mockReturnThis(),
  };

  const mockDiscordClient = {
    guilds: {
      fetch: jest.fn().mockReturnThis(),
    },
  };

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
  };

  const getMockGuildResponseDto = (): GetGuildResponseDto => ({
    _id: '64d97f51e9c3c967eceab9fa',
    guildId: '850840267082563596',
    guildName: 'Test Guild',
    poapManagerRoleId: '1130525129131167786',
    privateChannelId: '850840267082563600',
    newsChannelId: '1130525131937161286',
  });

  const getMockGuildSchema = (): DiscordGuild => ({
    guildId: '850840267082563596',
    guildName: 'Test Guild',
    privateChannelId: '850840267082563600',
    newsChannelId: '1130525131937161286',
    poapManagerRoleId: '1130525129131167786',
  });

  const getMockExecutionContext = () => ({
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnThis(),
    body: {
      guildId: '123',
      organizerId: '456',
    },
  });

  const getMockDiscordMember = () => ({
    roles: {
      cache: {
        has: jest.fn().mockReturnValue(true),
      },
    },
  });

  const getMockGuild = (mockValue: any) => ({
    members: {
      fetch: jest.fn().mockReturnValue(mockValue),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: '__inject_discord_client__', useValue: mockDiscordClient },
        { provide: Logger, useValue: mockLogger },
        { provide: getModelToken(DiscordGuild.name), useValue: mockGuildModel },
      ],
    }).compile();
    service = module.get<AuthGuard>(AuthGuard);
    mockExecutionContext = getMockExecutionContext();

    spyLoggerError = jest.spyOn(mockLogger, 'error');
    spyLoggerVerbose = jest.spyOn(mockLogger, 'verbose');
    spyCacheManagerGet = jest.spyOn(mockCacheManager, 'get');
    spyGuildModelFindOne = jest.spyOn(mockGuildModel, 'findOne');
    spyDiscordClientGuildsFetch = jest.spyOn(mockDiscordClient.guilds, 'fetch');

    spyCacheManagerGet.mockReturnValue(
      Promise.resolve(getMockGuildResponseDto()),
    );
    spyGuildModelFindOne.mockReturnValue(Promise.resolve(getMockGuildSchema()));
    spyDiscordClientGuildsFetch.mockReturnValue(
      Promise.resolve(getMockGuild(Promise.resolve(getMockDiscordMember()))),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthGuard);
    expect(service.canActivate).toBeDefined();
  });

  it('should return false if guild for not found', async () => {
    spyCacheManagerGet.mockReturnValue(Promise.resolve(null));
    spyGuildModelFindOne.mockReturnValue(Promise.resolve(null));
    const result = await service.canActivate(mockExecutionContext);
    expect(result).toBeFalsy();
    expect(spyLoggerError).toHaveBeenCalledWith(
      `Auth request rejected. Guild not found in cache or db for guildId: ${mockExecutionContext.body.guildId}`,
    );
  });

  it('should throw an error if guild fetch fails', async () => {
    const mockError = new Error('test error');
    spyDiscordClientGuildsFetch.mockReturnValue(Promise.reject(mockError));
    const result = await service.canActivate(mockExecutionContext);
    expect(result).toBeFalsy();
    expect(spyLoggerError).toHaveBeenCalledWith(
      `Failed to fetch guildId: ${mockExecutionContext.body.guildId}, organizerId: ${mockExecutionContext.body.organizerId}`,
      mockError,
    );
  });

  it('should throw error if guildMember is not found', async () => {
    const mockError = new Error('test error');
    spyDiscordClientGuildsFetch.mockReturnValue(
      Promise.resolve(getMockGuild(Promise.reject(mockError))),
    );
    const result = await service.canActivate(mockExecutionContext);
    expect(result).toBeFalsy();
    expect(spyLoggerError).toHaveBeenCalledWith(
      `Failed to fetch guildId: ${mockExecutionContext.body.guildId}, organizerId: ${mockExecutionContext.body.organizerId}`,
      mockError,
    );
  });

  it('should return false for user not a POAP manager', async () => {
    const mockDiscordMember = getMockDiscordMember();
    mockDiscordMember.roles.cache.has.mockReturnValue(false);
    spyDiscordClientGuildsFetch.mockReturnValue(
      Promise.resolve(getMockGuild(Promise.resolve(mockDiscordMember))),
    );
    const result = await service.canActivate(mockExecutionContext);
    expect(result).toBeFalsy();
    expect(spyLoggerError).toHaveBeenCalledWith(
      `Auth request rejected. User is not a POAP manager for organizerId: ${mockExecutionContext.body.organizerId}`,
    );
  });

  it('should return true for guildMember is authorized', async () => {
    const result = await service.canActivate(mockExecutionContext);
    expect(result).toBeTruthy();
    expect(spyLoggerVerbose).toHaveBeenCalledWith(
      `Auth request accepted for guildId: ${mockExecutionContext.body.guildId} and organizerId: ${mockExecutionContext.body.organizerId}`,
    );
  });
});
