import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { CommunityEvent } from './schemas/community-event.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getModelToken(CommunityEvent.name), useValue: mockModel },
        Logger,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
