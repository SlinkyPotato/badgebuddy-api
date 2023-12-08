import { ClientIdGuard } from './client-id.guard';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('ClientIdGuard', () => {
  let guard: ClientIdGuard;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('')
  };

  const mockLogger = {
    warn: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        ClientIdGuard,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    guard = module.get<ClientIdGuard>(ClientIdGuard);
  })

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
