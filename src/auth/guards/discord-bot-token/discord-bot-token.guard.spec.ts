import { Test } from '@nestjs/testing';
import { DiscordBotTokenGuard } from './discord-bot-token.guard';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('DiscordBotTokenGuard', () => {
  let discordBotTokenGuard: DiscordBotTokenGuard;

  const mockLogger = {
    log: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    verbose: jest.fn().mockReturnThis(),
  };

  const mockJwtService = {
    verify: jest.fn().mockReturnThis(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        DiscordBotTokenGuard,
        { provide: Logger, useValue: mockLogger },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    discordBotTokenGuard =
      testModule.get<DiscordBotTokenGuard>(DiscordBotTokenGuard);
  });

  it('should be defined', () => {
    expect(discordBotTokenGuard).toBeDefined();
  });
});
