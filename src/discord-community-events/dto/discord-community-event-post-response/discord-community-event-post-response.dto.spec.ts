import { DiscordCommunityEventPostResponseDto } from './discord-community-event-post-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordCommunityEventPostResponseDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventPostResponseDto()).toBeDefined();
  });
});
