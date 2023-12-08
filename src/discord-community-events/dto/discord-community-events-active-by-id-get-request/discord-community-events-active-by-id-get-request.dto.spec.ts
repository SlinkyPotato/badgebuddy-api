import { DiscordCommunityEventsActiveByIdGetRequestDto } from './discord-community-events-active-by-id-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('CommunityEventsActiveByIdGetRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventsActiveByIdGetRequestDto()).toBeDefined();
  });
});
