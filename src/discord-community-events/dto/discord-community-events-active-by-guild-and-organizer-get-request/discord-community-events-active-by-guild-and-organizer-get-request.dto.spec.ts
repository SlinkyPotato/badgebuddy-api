import { DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto } from './discord-community-events-active-by-guild-and-organizer-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('CommunityEventsActiveByGuildAndOrganizerGetRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto()).toBeDefined();
  });
});
