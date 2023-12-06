import { DiscordActiveCommunityEventsGetResponseDto } from './active-community-events-get-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('ActiveCommunityEventsGetResponseDto', () => {
  it('should be defined', () => {
    expect(new DiscordActiveCommunityEventsGetResponseDto()).toBeDefined();
  });
});
