import { Test, TestingModule } from '@nestjs/testing';
import { PoapService } from './poap.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';

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
      providers: [
        PoapService,
        { provide: Logger, useValue: mockLogger },
        { provide: DataSource, useValue: jest.fn() },
        { provide: HttpService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<PoapService>(PoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
