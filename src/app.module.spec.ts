import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterAll,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

jest.mock('@badgebuddy/common', () => ({
  CommonConfigModule: {
    forRoot: jest.fn().mockReturnValue(
      Test.createTestingModule({
        providers: [],
      }),
    ),
  },
  RedisConfigModule: {
    forRootAsync: jest.fn().mockImplementation(() => {
      return Test.createTestingModule({});
    }),
  },
  RedisBullConfigModule: {
    forRootAsync: jest.fn().mockImplementation(() => {
      return Test.createTestingModule({});
    }),
  },
  MongooseConfigModule: {
    forRootAsync: jest.fn().mockImplementation(() => {
      return Test.createTestingModule({});
    }),
  },
  DiscordConfigModule: {
    forRootAsync: jest.fn().mockImplementation(() => {
      return Test.createTestingModule({});
    }),
  },
}));

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue(
      Test.createTestingModule({
        providers: [],
      }),
    ),
  },
}));

jest.mock('@nestjs/bull', () => ({
  BullModule: {
    forRootAsync: jest.fn().mockImplementation((config: any) => {
      config.useFactory();
      return Test.createTestingModule({});
    }),
  },
}));

jest.mock('@nestjs/cache-manager', () => ({
  CacheModule: {
    registerAsync: jest.fn().mockImplementation((config: any) => {
      config.useFactory();
      return Test.createTestingModule({});
    }),
  },
}));

jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forRootAsync: jest.fn().mockImplementation((config: any) => {
      const mockConfigService = {
        get: jest.fn().mockReturnValue('mongodb://localhost:27017'),
      };
      config.useFactory(mockConfigService);
      return Test.createTestingModule({});
    }),
  },
}));

jest.mock('@discord-nestjs/core', () => ({
  DiscordModule: {
    forRootAsync: jest.fn().mockImplementation((config: any) => {
      config.useFactory();
      return Test.createTestingModule({});
    }),
  },
}));

jest.mock('./api/api.module', () => ({
  ApiModule: jest.fn().mockReturnValue(Test.createTestingModule({})),
}));

jest.mock('./discord-events/discord-events.module', () => ({
  DiscordEventsModule: jest.fn().mockReturnValue(Test.createTestingModule({})),
}));

describe('AppModule', () => {
  let module: TestingModule;

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
