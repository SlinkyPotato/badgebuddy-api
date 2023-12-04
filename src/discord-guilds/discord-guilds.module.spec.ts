import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterAll,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscordGuildsModule } from './discord-guilds.module';

jest.mock('./guilds.service', () => ({
  GuildsService: jest.fn().mockReturnThis(),
}));

jest.mock('./guilds.controller');

jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forFeature: jest.fn().mockReturnValue(
      Test.createTestingModule({
        providers: [],
      }),
    ),
  },
}));

jest.mock('@nestjs/config', () => ({
  ConfigModule: jest.fn().mockReturnValue(
    Test.createTestingModule({
      providers: [],
    }),
  ),
}));

jest.mock('@badgebuddy/common', () => ({
  DiscordGuild: {
    name: 'DiscordGuild',
  },
  DiscordGuildSchema: jest.fn().mockReturnThis(),
}));

describe('GuildsModule', () => {
  let module: TestingModule;
  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DiscordGuildsModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});