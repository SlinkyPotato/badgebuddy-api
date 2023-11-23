import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from '@jest/globals';
import GetActiveEventsRequestDto from './dto/active-events-get-request.dto';
import GetActiveEventsResponseDto from './dto/active-events-get-response.dto';
import PostEventRequestDto from './dto/event-post-request.dto';
import PostEventResponseDto from './dto/event-post-response.dto';
import PutEventRequestDto from './dto/event-put-request.dto';
import PutEventResponseDto from './dto/event-put-response.dto';

jest.mock('./guards/auth.guard.ts', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('@nestjs/cache-manager', () => ({
  CacheInterceptor: jest.fn().mockImplementation(() => ({})),
}));

describe('EventsController', () => {
  let controller: EventsController;

  const mockService = {
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    getActiveEvents: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call controller.start() and return PostEventResponseDto', async () => {
    const mockRequest: PostEventRequestDto = {
      eventName: 'test',
      duration: 30,
      voiceChannelId: '850840267082563600',
      guildId: '850840267082563596',
      organizerId: '159014522542096384',
    };
    const currentDate = new Date();

    const mockResponse: PostEventResponseDto = {
      _id: '123456789',
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 30 * 60000),
    };

    mockService.start.mockReturnValue(Promise.resolve(mockResponse));

    const result = await controller.start(mockRequest);

    expect(result).toEqual(mockResponse);
    expect(mockService.start).toHaveBeenCalledTimes(1);
    expect(mockService.start).toHaveBeenCalledWith(mockRequest);
  });

  it('should call controller.stop() and return PutEventResponseDto', async () => {
    const mockRequest: PutEventRequestDto = {
      guildId: '850840267082563596',
      organizerId: '159014522542096384',
      _id: '64e903cbac9d84d78747d109',
      voiceChannelId: '850840267082563600',
    };

    const mockResponse: PutEventResponseDto = {
      _id: '64e903cbac9d84d78747d109',
      isActive: true,
    };

    mockService.stop.mockReturnValue(Promise.resolve(mockResponse));

    const result = await controller.stop(mockRequest);

    expect(result).toEqual(mockResponse);
    expect(mockService.stop).toHaveBeenCalledTimes(1);
    expect(mockService.stop).toHaveBeenCalledWith(mockRequest);
  });

  it('should call controller.getActive() and return GetActiveEventsResponseDto', async () => {
    const mockRequest: GetActiveEventsRequestDto = {
      guildId: '987654321',
    };

    const currentDate = new Date();

    const mockResponse: GetActiveEventsResponseDto = {
      events: [
        {
          _id: '64e903cbac9d84d78747d109',
          startDate: currentDate,
          endDate: new Date(currentDate.getTime() + 30 * 60000),
          eventName: 'test event',
          guildId: '850840267082563596',
          voiceChannelId: '850840267082563600',
          organizerId: '159014522542096384',
        },
      ],
    };

    mockService.getActiveEvents.mockReturnValue(Promise.resolve(mockResponse));

    const result = await controller.getActive(mockRequest);

    expect(result).toEqual(mockResponse);
    expect(mockService.getActiveEvents).toHaveBeenCalledTimes(1);
    expect(mockService.getActiveEvents).toHaveBeenCalledWith(mockRequest);
  });
});
