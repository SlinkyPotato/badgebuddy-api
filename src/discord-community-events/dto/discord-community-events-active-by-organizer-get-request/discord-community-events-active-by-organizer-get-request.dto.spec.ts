import { DiscordCommunityEventsActiveByOrganizerGetRequestDto } from './discord-community-events-active-by-organizer-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('CommunityEventsActiveByOrganizerGetRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventsActiveByOrganizerGetRequestDto()).toBeDefined();
  });
});
