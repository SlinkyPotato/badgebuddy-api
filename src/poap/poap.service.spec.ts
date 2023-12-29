import { Test, TestingModule } from '@nestjs/testing';
import { PoapService } from './poap.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';

describe('PoapService', () => {
  let service: PoapService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoapService, { provide: Logger, useValue: mockLogger }],
    }).compile();

    service = module.get<PoapService>(PoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
