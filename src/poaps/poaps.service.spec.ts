import { Test, TestingModule } from '@nestjs/testing';
import { PoapsService } from './poaps.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';

describe('PoapsService', () => {
  let service: PoapsService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoapsService, { provide: Logger, useValue: mockLogger }],
    }).compile();

    service = module.get<PoapsService>(PoapsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
