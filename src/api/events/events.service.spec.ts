import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CommunityEvent } from '@badgebuddy/common';
import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from '@jest/globals';
import PostEventRequestDto from './dto/post/post-event.request.dto';
import * as mongoose from 'mongoose';
import PostEventResponseDto from './dto/post/post-event.response.dto';
import PutEventRequestDto from './dto/put/put-event.request.dto';
import PutEventResponseDto from './dto/put/put-event.response.dto';
import GetActiveEventsRequestDto from './dto/get/get-active-events.request.dto';
import GetActiveEventsResponseDto from './dto/get/get-active-events.response.dto';

describe('EventsService', () => {
  let service: EventsService;
  const startDate = new Date();

  const mockCommunityEventModel = {
    exists: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  };

  const mockCacheManager = {
    del: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };

  const mockBullQueue = {
    add: jest.fn().mockReturnThis(),
  };

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
  };

  const getMockCommunityEvent = (): CommunityEvent & {
    _id?: mongoose.Types.ObjectId;
    save: jest.MockedFunction<any>;
  } => ({
    _id: new mongoose.Types.ObjectId('60b0b8b0b9b3a1a1b4b3b2b1'),
    eventName: 'test event',
    organizerId: '159014522542096384',
    voiceChannelId: '850840267082563600',
    guildId: '64e903cbac9d84d78747d109',
    startDate: startDate,
    endDate: new Date(startDate.getTime() + 30 * 60000),
    isActive: true,
    save: jest.fn().mockReturnThis(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(CommunityEvent.name),
          useValue: mockCommunityEventModel,
        },
        { provide: Logger, useValue: mockLogger },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: 'BullQueue_events', useValue: mockBullQueue },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('start', () => {
    const getMockPostEventRequestDto = (): PostEventRequestDto => ({
      guildId: '64e903cbac9d84d78747d109',
      organizerId: '159014522542096384',
      eventName: 'test event',
      voiceChannelId: '850840267082563600',
      duration: 30,
    });

    it('should throw event already exists', async () => {
      mockCommunityEventModel.exists.mockReturnValue({
        exec: () => Promise.resolve(true),
      });
      try {
        await service.start(getMockPostEventRequestDto());
      } catch (e) {
        expect(e.message).toEqual('Event in this channel is already active');
      }
    });

    it('should throw mongoose error for failed to create event', async () => {
      const mockMongoError = new mongoose.Error('test error');
      mockCommunityEventModel.exists.mockReturnValue({
        exec: () => Promise.resolve(false),
      });
      mockCommunityEventModel.create.mockReturnValue(
        Promise.reject(mockMongoError),
      );
      try {
        await service.start(getMockPostEventRequestDto());
      } catch (e) {
        expect(e).toEqual(mockMongoError);
      }
      expect(mockCommunityEventModel.create).toBeCalledTimes(1);
    });

    it('should throw general error for failed to create event', async () => {
      const mockError = new Error('Failed to create event');
      mockCommunityEventModel.exists.mockReturnValue({
        exec: () => Promise.resolve(false),
      });
      mockCommunityEventModel.create.mockReturnValue({});
      try {
        await service.start(getMockPostEventRequestDto());
      } catch (e) {
        expect(e).toEqual(mockError);
      }
      expect(mockCommunityEventModel.create).toBeCalledTimes(1);
    });

    it('should create community event', async () => {
      const mockCommunityEvent = getMockCommunityEvent();
      const mockPostEventResponseDto: PostEventResponseDto = {
        _id: mockCommunityEvent._id?.toString() as string,
        startDate: mockCommunityEvent.startDate,
        endDate: mockCommunityEvent.endDate,
      };
      mockCommunityEventModel.exists.mockReturnValue({
        exec: () => Promise.resolve(false),
      });
      mockCommunityEventModel.create.mockReturnValue(mockCommunityEvent);
      const result = await service.start(getMockPostEventRequestDto());
      expect(mockCommunityEventModel.create).toBeCalledTimes(1);
      expect(mockCacheManager.del).toBeCalledTimes(6);
      expect(mockCacheManager.set).toBeCalledTimes(1);
      expect(mockBullQueue.add).toBeCalledTimes(1);
      expect(mockBullQueue.add).toBeCalledWith('start', {
        eventId: mockCommunityEvent._id?.toString(),
      });
      expect(result).toEqual(mockPostEventResponseDto);
    });
  });

  describe('stop', () => {
    const getMockPutEventRequestDto = (): PutEventRequestDto => ({
      _id: '60b0b8b0b9b3a1a1b4b3b2b1',
      guildId: '64e903cbac9d84d78747d109',
      organizerId: '159014522542096384',
      voiceChannelId: '850840267082563600',
    });

    it('should throw active event not found', async () => {
      mockCommunityEventModel.findOne.mockReturnValue({
        exec: () => Promise.resolve(null),
      });
      try {
        await service.stop(getMockPutEventRequestDto());
      } catch (e) {
        expect(e.message).toEqual('Active event not found');
      }
    });

    it('should throw mongo error for not saving', async () => {
      const mockError = new Error('Failed to update event');
      const mockCommunityEvent = getMockCommunityEvent();
      delete mockCommunityEvent._id;

      mockCommunityEventModel.findOne.mockReturnValue({
        exec: () => Promise.resolve(mockCommunityEvent),
      });
      try {
        await service.stop(getMockPutEventRequestDto());
      } catch (e) {
        expect(e).toEqual(mockError);
        expect(e.message).toEqual(mockError.message);
      }
    });

    it('should throw mongo error for failed to save', async () => {
      const mockMongooseError = new mongoose.Error('Failed to update event');
      const mockCommunityEvent = getMockCommunityEvent();
      mockCommunityEvent.save.mockReturnValue(
        Promise.reject(mockMongooseError),
      );

      mockCommunityEventModel.findOne.mockReturnValue({
        exec: () => Promise.resolve(mockCommunityEvent),
      });
      try {
        await service.stop(getMockPutEventRequestDto());
      } catch (e) {
        expect(e).toEqual(mockMongooseError);
        expect(e.message).toEqual(mockMongooseError.message);
      }
    });

    it('should stop community event', async () => {
      const mockCommunityEvent = getMockCommunityEvent();
      mockCommunityEventModel.findOne.mockReturnValue({
        exec: () => Promise.resolve(mockCommunityEvent),
      });
      const result = await service.stop(getMockPutEventRequestDto());
      expect(mockCommunityEventModel.findOne).toBeCalledTimes(1);
      expect(mockCacheManager.del).toBeCalledTimes(7);
      expect(mockBullQueue.add).toBeCalledTimes(1);
      expect(mockBullQueue.add).toBeCalledWith('end', {
        eventId: mockCommunityEvent._id?.toString(),
      });
      expect(result).toEqual({
        _id: mockCommunityEvent._id?.toString() as string,
        isActive: false,
      } as PutEventResponseDto);
    });
  });

  describe('getActiveEvents', () => {
    const getMockQuery = (): GetActiveEventsRequestDto => ({});

    const getMockEvents = (): (CommunityEvent & {
      _id: mongoose.Types.ObjectId;
    })[] => [
      {
        _id: new mongoose.Types.ObjectId('60b0b8b0b9b3a1a1b4b3b2b1'),
        eventName: 'test event',
        organizerId: '159014522542096384',
        voiceChannelId: '850840267082563600',
        guildId: '64e903cbac9d84d78747d109',
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 30 * 60000),
        isActive: true,
      },
      {
        _id: new mongoose.Types.ObjectId('64e90676ac9d84d78747d10a'),
        eventName: 'test event',
        organizerId: '159014522542096384',
        voiceChannelId: '850840267082563600',
        guildId: '64e903cbac9d84d78747d109',
        startDate: new Date('2023-08-25T19:52:22.320+00:00'),
        endDate: new Date('2023-08-25T20:22:22.320+00:00'),
        isActive: true,
      },
    ];

    it('should throw error for too many query parameters', async () => {
      const mockQuery = getMockQuery();
      mockQuery.eventId = '60b0b8b0b9b3a1a1b4b3b2b1';
      mockQuery.guildId = '64e903cbac9d84d78747d109';
      mockQuery.voiceChannelId = '850840267082563600';

      try {
        await service.getActiveEvents(mockQuery);
      } catch (e) {
        expect(e).toEqual(new Error('Too many query parameters'));
        expect(e.message).toEqual('Too many query parameters');
      }
    });

    it('should throw mongo error for failed to find events', async () => {
      const mockMongooseError = new mongoose.Error('Failed to find events');
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.reject(mockMongooseError),
      });
      try {
        await service.getActiveEvents(getMockQuery());
      } catch (e) {
        expect(e).toEqual(mockMongooseError);
        expect(e.message).toEqual(mockMongooseError.message);
      }
    });

    it('should return empty array', async () => {
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.resolve([]),
      });
      const result = await service.getActiveEvents(getMockQuery());
      expect(mockCommunityEventModel.find).toBeCalledTimes(1);
      expect(result).toEqual({ events: [] });
    });

    it('should return active events for eventId', async () => {
      const mockEvents = getMockEvents();
      const mockQuery = getMockQuery();
      mockQuery.eventId = mockEvents[0]._id.toString();
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.resolve([mockEvents[0]]),
      });
      const result = await service.getActiveEvents(mockQuery);
      expect(mockCommunityEventModel.find).toBeCalledTimes(1);
      const expectedResponse: GetActiveEventsResponseDto = {
        events: [
          {
            _id: mockEvents[0]._id.toString(),
            eventName: mockEvents[0].eventName,
            guildId: mockEvents[0].guildId,
            voiceChannelId: mockEvents[0].voiceChannelId,
            organizerId: mockEvents[0].organizerId,
            startDate: mockEvents[0].startDate,
            endDate: mockEvents[0].endDate,
          },
        ],
      };
      expect(result).toEqual(expectedResponse);
    });

    it('should return active events for guildId', async () => {
      const mockEvents = getMockEvents();
      const mockQuery = getMockQuery();
      mockQuery.guildId = mockEvents[0].guildId;
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.resolve([mockEvents[0]]),
      });
      const result = await service.getActiveEvents(mockQuery);
      expect(mockCommunityEventModel.find).toBeCalledTimes(1);
      const expectedResponse: GetActiveEventsResponseDto = {
        events: [
          {
            _id: mockEvents[0]._id.toString(),
            eventName: mockEvents[0].eventName,
            guildId: mockEvents[0].guildId,
            voiceChannelId: mockEvents[0].voiceChannelId,
            organizerId: mockEvents[0].organizerId,
            startDate: mockEvents[0].startDate,
            endDate: mockEvents[0].endDate,
          },
        ],
      };
      expect(result).toEqual(expectedResponse);
    });

    it('should return active events for voiceChannelId', async () => {
      const mockEvents = getMockEvents();
      const mockQuery = getMockQuery();
      mockQuery.voiceChannelId = mockEvents[0].voiceChannelId;
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.resolve([mockEvents[0]]),
      });
      const result = await service.getActiveEvents(mockQuery);
      expect(mockCommunityEventModel.find).toBeCalledTimes(1);
      const expectedResponse: GetActiveEventsResponseDto = {
        events: [
          {
            _id: mockEvents[0]._id.toString(),
            eventName: mockEvents[0].eventName,
            guildId: mockEvents[0].guildId,
            voiceChannelId: mockEvents[0].voiceChannelId,
            organizerId: mockEvents[0].organizerId,
            startDate: mockEvents[0].startDate,
            endDate: mockEvents[0].endDate,
          },
        ],
      };
      expect(result).toEqual(expectedResponse);
    });

    it('should return active events for organizerId', async () => {
      const mockEvents = getMockEvents();
      const mockQuery = getMockQuery();
      mockQuery.organizerId = mockEvents[0].organizerId;
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.resolve([mockEvents[0]]),
      });
      const result = await service.getActiveEvents(mockQuery);
      expect(mockCommunityEventModel.find).toBeCalledTimes(1);
      const expectedResponse: GetActiveEventsResponseDto = {
        events: [
          {
            _id: mockEvents[0]._id.toString(),
            eventName: mockEvents[0].eventName,
            guildId: mockEvents[0].guildId,
            voiceChannelId: mockEvents[0].voiceChannelId,
            organizerId: mockEvents[0].organizerId,
            startDate: mockEvents[0].startDate,
            endDate: mockEvents[0].endDate,
          },
        ],
      };
      expect(result).toEqual(expectedResponse);
    });

    it('should return active events for guildId and organizerId', async () => {
      const mockEvents = getMockEvents();
      const mockQuery = getMockQuery();
      mockQuery.guildId = mockEvents[0].guildId;
      mockQuery.organizerId = mockEvents[0].organizerId;
      mockCommunityEventModel.find.mockReturnValue({
        exec: () => Promise.resolve([mockEvents[0]]),
      });
      const result = await service.getActiveEvents(mockQuery);
      expect(mockCommunityEventModel.find).toBeCalledTimes(1);
      const expectedResponse: GetActiveEventsResponseDto = {
        events: [
          {
            _id: mockEvents[0]._id.toString(),
            eventName: mockEvents[0].eventName,
            guildId: mockEvents[0].guildId,
            voiceChannelId: mockEvents[0].voiceChannelId,
            organizerId: mockEvents[0].organizerId,
            startDate: mockEvents[0].startDate,
            endDate: mockEvents[0].endDate,
          },
        ],
      };
      expect(result).toEqual(expectedResponse);
    });
  });
});
