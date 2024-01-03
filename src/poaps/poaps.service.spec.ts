import { Test, TestingModule } from '@nestjs/testing';
import { PoapsService } from './poaps.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';

describe('PoapService', () => {
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
      providers: [
        PoapsService,
        { provide: Logger, useValue: mockLogger },
        { provide: DataSource, useValue: jest.fn() },
        { provide: HttpService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<PoapsService>(PoapsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
