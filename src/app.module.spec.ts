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
import { AuthModule } from './auth/auth.module';
import {
  DiscordCommunityEventsManageModule
} from './discord-community-events/discord-community-events-manage.module';

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
  DiscordConfigModule: {
    forRootAsync: jest.fn().mockImplementation(() => {
      return Test.createTestingModule({});
    }),
  },
  CommonTypeOrmModule: {
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

jest.mock('@discord-nestjs/core', () => ({
  DiscordModule: {
    forRootAsync: jest.fn().mockImplementation((config: any) => {
      config.useFactory();
      return Test.createTestingModule({});
    }),
  },
}));

jest.mock('./discord-bot/discord-bot.module', () => ({
  DiscordBotModule: jest.fn().mockReturnValue(Test.createTestingModule({})),
}));

jest.mock('./discord-community-events/discord-community-events.module', () => ({
  DiscordCommunityEventsModule: jest.fn().mockReturnValue(Test.createTestingModule({})),
}));

jest.mock('./auth/auth.module', () => ({
  AuthModule: jest.fn().mockReturnValue(Test.createTestingModule({})),
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
