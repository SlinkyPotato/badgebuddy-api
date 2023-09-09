import { Test, TestingModule } from '@nestjs/testing';
import { GuildsService } from './guilds.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { DiscordGuild } from '@solidchain/badge-buddy-common';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { MongooseError } from 'mongoose';
import PostGuildRequestDto from './dto/post/guild.request.dto';
import * as mongoose from 'mongoose';
import GetGuildResponseDto from './dto/get/guild.response.dto';
import PostGuildResponseDto from './dto/post/guild.response.dto';

describe('GuildService', () => {
  let service: GuildsService;

  const mockModel = {
    create: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockReturnThis(),
    }),
    findOneAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockReturnThis(),
    }),
  };

  const mockCacheManager = {
    get: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
  };

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    // https://docs.nestjs.com/techniques/mongodb#testing
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildsService,
        { provide: getModelToken(DiscordGuild.name), useValue: mockModel },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<GuildsService>(GuildsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toHaveProperty('get');
    expect(service).toHaveProperty('create');
    expect(service).toHaveProperty('remove');
  });

  describe('create', () => {
    let spyDiscordGuildModelCreate: jest.Spied<any>;
    let spyDiscordGuildModelFindOne: jest.Spied<any>;

    beforeEach(() => {
      spyDiscordGuildModelFindOne = jest.spyOn(
        mockModel.findOne() as any,
        'exec',
      );

      spyDiscordGuildModelCreate = jest.spyOn(mockModel, 'create');
    });

    it('should throw for failing to pull discord build', async () => {
      const mockPostGuildRequestDto: PostGuildRequestDto = {
        guildName: 'Test Guild',
        poapManagerRoleId: '1130525129131167786',
        privateChannelId: '850840267082563600',
        newsChannelId: '1130525131937161286',
      };
      const mockError = new MongooseError('test');
      spyDiscordGuildModelFindOne.mockReturnValue(Promise.reject(mockError));

      try {
        await service.create('850840267082563596', mockPostGuildRequestDto);
      } catch (e) {
        expect(e).toBeInstanceOf(MongooseError);
      }
    });

    it('should throw for discord guild already registered', async () => {
      const mockPostGuildRequestDto: PostGuildRequestDto = {
        guildName: 'Test Guild',
        poapManagerRoleId: '1130525129131167786',
        privateChannelId: '850840267082563600',
        newsChannelId: '1130525131937161286',
      };
      const mockGuild: DiscordGuild & { _id: mongoose.Types.ObjectId } = {
        _id: new mongoose.Types.ObjectId('64e76ac997f0abc13a431902'),
        guildId: '850840267082563596',
        guildName: 'Test Guild',
        privateChannelId: '1100470846490951790',
        poapManagerRoleId: '1130525129131167786',
        newsChannelId: '1130525131937161286',
      };
      spyDiscordGuildModelFindOne.mockReturnValue(Promise.resolve(mockGuild));

      try {
        await service.create('850840267082563596', mockPostGuildRequestDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e).toHaveProperty('message', 'Guild already registered');
      }
    });

    it('should create a new guild', async () => {
      const mockPostGuildRequestDto: PostGuildRequestDto = {
        guildName: 'Test Guild',
        poapManagerRoleId: '1130525129131167786',
        privateChannelId: '850840267082563600',
        newsChannelId: '1130525131937161286',
      };
      const mockGuild: DiscordGuild & { _id: mongoose.Types.ObjectId } = {
        _id: new mongoose.Types.ObjectId('64e76ac997f0abc13a431902'),
        guildId: '850840267082563596',
        guildName: 'Test Guild',
        privateChannelId: '1100470846490951790',
        poapManagerRoleId: '1130525129131167786',
        newsChannelId: '1130525131937161286',
      };
      const mockPostGuildResponseDto: PostGuildResponseDto = {
        _id: '64e76ac997f0abc13a431902',
      };
      spyDiscordGuildModelFindOne.mockReturnValue(Promise.resolve(null));
      spyDiscordGuildModelCreate.mockReturnValue(Promise.resolve(mockGuild));

      const result = await service.create(
        '850840267082563596',
        mockPostGuildRequestDto,
      );
      expect(result).toEqual(mockPostGuildResponseDto);
    });

    it('should throw for failing to create a new guild', async () => {
      const mockPostGuildRequestDto: PostGuildRequestDto = {
        guildName: 'Test Guild',
        poapManagerRoleId: '1130525129131167786',
        privateChannelId: '850840267082563600',
        newsChannelId: '1130525131937161286',
      };
      const mockError = new MongooseError('test');
      spyDiscordGuildModelFindOne.mockReturnValue(Promise.resolve(null));
      spyDiscordGuildModelCreate.mockReturnValue(Promise.reject(mockError));

      try {
        await service.create('850840267082563596', mockPostGuildRequestDto);
      } catch (e) {
        expect(e).toBeInstanceOf(MongooseError);
      }
    });
  });

  describe('remove', () => {
    let spyCacheDel: jest.Spied<any>;
    let spyDiscordGuildModelFindOneAndDelete: jest.Spied<any>;

    beforeEach(() => {
      spyDiscordGuildModelFindOneAndDelete = jest.spyOn(
        mockModel.findOneAndDelete() as any,
        'exec',
      );
      spyCacheDel = jest.spyOn(mockCacheManager, 'del');
    });

    it('should throw for failing to pull discord build', async () => {
      const mockError = new MongooseError('test');
      spyDiscordGuildModelFindOneAndDelete.mockReturnValue(
        Promise.reject(mockError),
      );
      try {
        await service.remove('850840267082563596');
      } catch (e) {
        expect(e).toBeInstanceOf(MongooseError);
      }
    });

    it('should throw for guild not found', async () => {
      spyDiscordGuildModelFindOneAndDelete.mockReturnValue(
        Promise.resolve(null),
      );
      try {
        await service.remove('850840267082563596');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e).toHaveProperty('message', 'Guild not found');
      }
    });

    it('should remove a guild', async () => {
      const mockGuild: DiscordGuild & { _id: mongoose.Types.ObjectId } = {
        _id: new mongoose.Types.ObjectId('64e76ac997f0abc13a431902'),
        guildId: '850840267082563596',
        guildName: 'Test Guild',
        privateChannelId: '1100470846490951790',
        poapManagerRoleId: '1130525129131167786',
        newsChannelId: '1130525131937161286',
      };
      spyDiscordGuildModelFindOneAndDelete.mockReturnValue(
        Promise.resolve(mockGuild),
      );
      await service.remove('850840267082563596');
      expect(spyCacheDel).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    let spyDiscordGuildModelFindOne: jest.Spied<any>;

    beforeEach(() => {
      spyDiscordGuildModelFindOne = jest.spyOn(
        mockModel.findOne() as any,
        'exec',
      );
    });

    it('should throw for failing to pull discord build', async () => {
      const mockError = new MongooseError('test');
      spyDiscordGuildModelFindOne.mockReturnValue(Promise.reject(mockError));
      try {
        await service.get('850840267082563596');
      } catch (e) {
        expect(e).toBeInstanceOf(MongooseError);
      }
    });

    it('should throw for guild not found', async () => {
      spyDiscordGuildModelFindOne.mockReturnValue(Promise.resolve(null));
      try {
        await service.get('850840267082563596');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e).toHaveProperty('message', 'Guild not found');
      }
    });

    it('should get a guild', async () => {
      const mockGuild: DiscordGuild & { _id: mongoose.Types.ObjectId } = {
        _id: new mongoose.Types.ObjectId('64e76ac997f0abc13a431902'),
        guildId: '850840267082563596',
        guildName: 'Test Guild',
        privateChannelId: '1100470846490951790',
        poapManagerRoleId: '1130525129131167786',
        newsChannelId: '1130525131937161286',
      };
      const mockResponse: GetGuildResponseDto = {
        _id: '64e76ac997f0abc13a431902',
        guildId: '850840267082563596',
        guildName: 'Test Guild',
        privateChannelId: '1100470846490951790',
        poapManagerRoleId: '1130525129131167786',
        newsChannelId: '1130525131937161286',
      };

      spyDiscordGuildModelFindOne.mockReturnValue(Promise.resolve(mockGuild));
      const result = await service.get('850840267082563596');
      expect(result).toEqual(mockResponse);
    });
  });
});
