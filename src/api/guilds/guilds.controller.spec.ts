import { Test, TestingModule } from '@nestjs/testing';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('RegistrationController', () => {
  let controller: GuildsController;

  const mockService = {
    get: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
  };

  const mockCacheManager = {
    get: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildsController],
      providers: [
        { provide: GuildsService, useValue: mockService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<GuildsController>(GuildsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
