import { DiscordCommunityEventPostRequestDto } from './discord-community-event-post-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordCommunityEventPostRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventPostRequestDto()).toBeDefined();
  });
});
