import { Test, TestingModule } from '@nestjs/testing';
import { PoapsController } from './poaps.controller';
import { PoapsService } from './poaps.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';

describe('PoapsController', () => {
  let controller: PoapsController;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoapsController],
      providers: [
        { provide: PoapsService, useValue: jest.fn() },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<PoapsController>(PoapsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
