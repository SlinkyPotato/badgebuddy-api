import { Test, TestingModule } from '@nestjs/testing';
import { PoapController } from './poap.controller';
import { PoapService } from './poap.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';

describe('PoapController', () => {
  let controller: PoapController;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoapController],
      providers: [
        { provide: PoapService, useValue: jest.fn() },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<PoapController>(PoapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
