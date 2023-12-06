import { DiscordCommunityEventsActiveByGuildGetRequestDto } from './discord-community-events-active-by-guild-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('CommunityEventsActiveByGuildGetRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventsActiveByGuildGetRequestDto()).toBeDefined();
  });
});
