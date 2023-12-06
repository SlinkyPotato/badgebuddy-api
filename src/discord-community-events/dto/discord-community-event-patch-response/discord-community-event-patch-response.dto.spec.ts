import { DiscordCommunityEventPatchResponseDto } from './discord-community-event-patch-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordCommunityEventPatchResponseDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventPatchResponseDto()).toBeDefined();
  });
});
