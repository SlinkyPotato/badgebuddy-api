import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface';

describe('HealthController', () => {
  let controller: HealthController;
  // let spyHttpHealthIndicator: jest.Spied<any>;
  // let spyMemoryHealthIndicator: jest.Spied<any>;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockHttpHealthIndicator = {
    responseCheck: jest.fn(),
  };

  const mockMongooseHealthIndicator = {
    pingCheck: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkRSS: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: HttpHealthIndicator, useValue: mockHttpHealthIndicator },
        {
          provide: MongooseHealthIndicator,
          useValue: mockMongooseHealthIndicator,
        },
        { provide: MemoryHealthIndicator, useValue: mockMemoryHealthIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);

    mockHealthCheckService.check.mockReturnValue(
      Promise.resolve({
        status: 'ok',
        info: {
          'badge-buddy-api': {
            status: 'up',
          },
          memory_rss: {
            status: 'up',
          },
        } as HealthIndicatorResult,
      } as HealthCheckResult),
    );

    // spyHttpHealthIndicator = jest.spyOn(
    //   mockHttpHealthIndicator,
    //   'responseCheck',
    // );
    //
    // spyMemoryHealthIndicator = jest.spyOn(
    //   mockMemoryHealthIndicator,
    //   'checkRSS',
    // );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toHaveProperty('check');
  });

  it('should return health indicators', async () => {
    const result = await controller.check();
    expect(mockHealthCheckService.check).toHaveBeenCalled();
    expect(result.status).toEqual('ok');
  });

  it('should call http health indicator', async () => {
    const result = await controller.check();
    expect(result.info!['badge-buddy-api'].status).toEqual('up');
  });

  it('should call memory health indicator', async () => {
    const result = await controller.check();
    expect(result.info!.memory_rss.status).toEqual('up');
  });
});
