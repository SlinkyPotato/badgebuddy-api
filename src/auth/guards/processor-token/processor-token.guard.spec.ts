import { Test, TestingModule } from '@nestjs/testing';
import { ProcessorTokenGuard } from './processor-token.guard';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('ProcessorTokenGuard', () => {
  let processorTokenGuard: ProcessorTokenGuard;

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
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessorTokenGuard,
        { provide: Logger, useValue: mockLogger },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    processorTokenGuard = testModule.get<ProcessorTokenGuard>(ProcessorTokenGuard);
  });


  it('should be defined', () => {
    expect(processorTokenGuard).toBeDefined();
  });
});
