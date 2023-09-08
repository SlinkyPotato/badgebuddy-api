import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('HealthController', () => {
  let controller: HealthController;
  let spyHttpHealthIndicator: jest.Spied<any>;
  let spyMongooseHealthIndicator: jest.Spied<any>;
  let spyMemoryHealthIndicator: jest.Spied<any>;

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

    mockHealthCheckService.check.mockImplementation(
      (healthIndicators: any[]): any[] => {
        return healthIndicators;
      },
    );

    spyHttpHealthIndicator = jest.spyOn(
      mockHttpHealthIndicator,
      'responseCheck',
    );
    spyMongooseHealthIndicator = jest.spyOn(
      mockMongooseHealthIndicator,
      'pingCheck',
    );
    spyMemoryHealthIndicator = jest.spyOn(
      mockMemoryHealthIndicator,
      'checkRSS',
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toHaveProperty('check');
  });

  it('should return health indicators', async () => {
    const result: any[] = (await controller.check()) as unknown as any[];
    expect(mockHealthCheckService.check).toHaveBeenCalled();
    expect(result[0]).toBeInstanceOf(Function);
    expect(result[1]).toBeInstanceOf(Function);
    expect(result[2]).toBeInstanceOf(Function);
  });

  it('should call http health indicator', async () => {
    const result: any[] = (await controller.check()) as unknown as any[];
    result[0]();
    expect(spyHttpHealthIndicator.mock.calls[0][0]).toEqual('badge-buddy-api');
    expect(spyHttpHealthIndicator.mock.calls[0][1]).toEqual(
      'http://localhost:3000/swagger',
    );
    expect(
      (spyHttpHealthIndicator.mock.calls[0][2] as any)({
        status: 200,
      }),
    ).toEqual(true);
  });

  it('should call mongoose health indicator', async () => {
    const result: any[] = (await controller.check()) as unknown as any[];
    result[1]();
    expect(spyMongooseHealthIndicator.mock.calls[0][0]).toEqual('mongo');
  });

  it('should call memory health indicator', async () => {
    const result: any[] = (await controller.check()) as unknown as any[];
    result[2]();
    expect(spyMemoryHealthIndicator.mock.calls[0][0]).toEqual('memory_rss');
    expect(spyMemoryHealthIndicator.mock.calls[0][1]).toEqual(
      1000 * 1024 * 1024,
    );
  });
});
