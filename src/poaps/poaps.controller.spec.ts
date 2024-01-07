import { Test, TestingModule } from '@nestjs/testing';
import { PoapsController } from './poaps.controller';
import { PoapsService } from './poaps.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import {
  PoapManagerGuard
} from '@/auth/guards/poap-manager/poap-manager.guard';


jest.mock('@/auth/guards/poap-manager/poap-manager.guard', () => ({
  PoapManagerGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('@nestjs/cache-manager', () => ({
  CacheInterceptor: jest.fn(),
}));

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
        { provide: AuthService, useValue: jest.fn() },
        { provide: PoapManagerGuard, useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<PoapsController>(PoapsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
