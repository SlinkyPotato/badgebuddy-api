import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CommunityEvent } from '@solidchain/badge-buddy-common';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('EventsService', () => {
  let service: EventsService;

  const mockModel = {
    exists: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  };

  const mockCacheManager = {
    del: jest.fn().mockReturnThis(),
  };

  const mockBullQueue = {
    add: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getModelToken(CommunityEvent.name), useValue: mockModel },
        Logger,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: 'BullQueue_events', useValue: mockBullQueue },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
