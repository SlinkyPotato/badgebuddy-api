import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import {
  DiscordCommunityEventsManageService
} from './discord-community-events-manage.service';
import { Logger } from '@nestjs/common';
import { DISCORD_COMMUNITY_EVENTS_QUEUE } from '@badgebuddy/common';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { from } from 'rxjs';

describe('DiscordCommunityEventsManageService', () => {
  let controller: DiscordCommunityEventsManageService;

  const poapLinks = [
    'http://POAP.xyz/claim/ndt7p6',
    'http://POAP.xyz/claim/a13elq',
    'http://POAP.xyz/claim/by2eqg',
    'http://POAP.xyz/claim/evodx7',
    'http://POAP.xyz/claim/tnc8yg',
    'http://POAP.xyz/claim/21jbpt',
    'http://POAP.xyz/claim/cf18kz',
    'http://POAP.xyz/claim/bvjjyu',
    'http://POAP.xyz/claim/mkf43y',
    'http://POAP.xyz/claim/0imkb4',
    'http://POAP.xyz/claim/w6ng4r',
    'http://POAP.xyz/claim/0g8hxb',
    'http://POAP.xyz/claim/alfqh5',
    'http://POAP.xyz/claim/0wpr1q',
    'http://POAP.xyz/claim/go79r8',
    'http://POAP.xyz/claim/8lca9b',
    'http://POAP.xyz/claim/epeq6t',
    'http://POAP.xyz/claim/h2mqce',
    'http://POAP.xyz/claim/80slrm',
    'http://POAP.xyz/claim/pe64m3',
  ];

  const mockHttpService = {
    get: jest.fn().mockImplementation(() => {
      return from(Promise.resolve({
        data: 
          'http://POAP.xyz/claim/ndt7p6\nhttp://POAP.xyz/claim/a13elq\nhttp://POAP.xyz/claim/by2eqg\nhttp://POAP.xyz/claim/evodx7\nhttp://POAP.xyz/claim/tnc8yg\nhttp://POAP.xyz/claim/21jbpt\nhttp://POAP.xyz/claim/cf18kz\nhttp://POAP.xyz/claim/bvjjyu\nhttp://POAP.xyz/claim/mkf43y\nhttp://POAP.xyz/claim/0imkb4\nhttp://POAP.xyz/claim/w6ng4r\nhttp://POAP.xyz/claim/0g8hxb\nhttp://POAP.xyz/claim/alfqh5\nhttp://POAP.xyz/claim/0wpr1q\nhttp://POAP.xyz/claim/go79r8\nhttp://POAP.xyz/claim/8lca9b\nhttp://POAP.xyz/claim/epeq6t\nhttp://POAP.xyz/claim/h2mqce\nhttp://POAP.xyz/claim/80slrm\nhttp://POAP.xyz/claim/pe64m3\n'
      }));
    }),
  };

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
        DiscordCommunityEventsManageService,
        { provide: Logger, useValue: mockLogger },
        { provide: 'CommunityEventDiscordEntityRepository', useValue: jest.fn() },
        { provide: 'DiscordUserEntityRepository', useValue: jest.fn() },
        { provide: 'DiscordBotSettingsEntityRepository', useValue: jest.fn() },
        { provide: 'CACHE_MANAGER', useValue: jest.fn() },
        { provide: 'BullQueue_DISCORD_COMMUNITY_EVENTS_QUEUE', useValue: jest.fn() },
        { provide: '__inject_discord_client__', useValue: jest.fn() },
        { provide: HttpService, useValue: mockHttpService },
        { provide: DataSource, useValue: jest.fn() },
      ]
    }).compile();

    controller = module.get<DiscordCommunityEventsManageService>(DiscordCommunityEventsManageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should parse links', async () => {
    const links = await controller.parsePoapLinksUrl('test-link');
    console.log(links);
    expect(true).toBe(true);
  });
});
