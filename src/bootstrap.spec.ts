import { describe, it, expect, jest } from '@jest/globals';
import bootstrap from './bootstrap';
import {
  CommonPinoLogger,
  CommonPinoLoggerService,
} from '@solidchain/badge-buddy-common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

jest.mock('@solidchain/badge-buddy-common', () => {
  const actual = jest.requireActual('@solidchain/badge-buddy-common') as object;

  return {
    __esModule: true,
    ...actual,
    CommonPinoLogger: jest.fn().mockImplementation(() => ({
      logger: jest.fn().mockReturnThis(),
    })),
    CommonPinoLoggerService: jest.fn().mockReturnThis(),
  };
});

jest.mock('@nestjs/core', () => {
  const actual = jest.requireActual('@nestjs/core') as object;

  return {
    __esModule: true,
    ...actual,
    NestFactory: {
      create: jest.fn().mockImplementation(() => ({
        use: jest.fn().mockReturnThis(),
        setGlobalPrefix: jest.fn().mockReturnThis(),
        enableCors: jest.fn().mockReturnThis(),
        useLogger: jest.fn().mockReturnThis(),
        listen: jest.fn().mockReturnThis(),
      })),
    },
  };
});

jest.mock('@nestjs/platform-fastify', () => {
  const actual = jest.requireActual('@nestjs/platform-fastify') as object;

  return {
    __esModule: true,
    ...actual,
    FastifyAdapter: jest.fn().mockImplementation(() => ({
      logger: jest.fn().mockReturnThis(),
    })),
    NestFastifyApplication: jest.fn().mockImplementation(() => ({
      use: jest.fn().mockReturnThis(),
      setGlobalPrefix: jest.fn().mockReturnThis(),
      enableCors: jest.fn().mockReturnThis(),
      useLogger: jest.fn().mockReturnThis(),
      listen: jest.fn().mockReturnThis(),
    })),
  };
});

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger') as object;

  return {
    __esModule: true,
    ...actual,
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle: () => ({
        setDescription: () => ({
          setVersion: () => ({
            build: () => jest.fn().mockReturnThis(),
          }),
        }),
      }),
    })),
    SwaggerModule: {
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
  };
});

describe('Bootstrap', () => {
  it('should be defined', () => {
    expect(bootstrap).toBeDefined();
  });

  it('should call app configuration', async () => {
    await bootstrap();
    expect(true).toBeTruthy();
    expect(CommonPinoLogger).toHaveBeenCalledTimes(1);
    expect(CommonPinoLoggerService).toHaveBeenCalledTimes(1);
    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(FastifyAdapter).toHaveBeenCalledTimes(1);
    expect(DocumentBuilder).toHaveBeenCalledTimes(1);
    expect(SwaggerModule.createDocument).toHaveBeenCalledTimes(1);
    expect(SwaggerModule.setup).toHaveBeenCalledTimes(1);
  });
});
