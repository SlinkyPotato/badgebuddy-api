import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import { GuildCreateEvent } from './guild-create.event';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GuildCreateService } from './guild-create.service';

describe('GuildCreateEvent', () => {
  let service: GuildCreateEvent;

  const mockLogger = {
    log: jest.fn(),
  };

  const mockGuildCreateService = {
    setup: jest.fn(),
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        GuildCreateEvent,
        { provide: Logger, useValue: mockLogger },
        { provide: GuildCreateService, useValue: mockGuildCreateService },
      ],
    }).compile();
    service = testModule.get(GuildCreateEvent);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
