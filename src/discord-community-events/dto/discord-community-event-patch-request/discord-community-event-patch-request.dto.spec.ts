import { DiscordCommunityEventPatchRequestDto } from './discord-community-event-patch-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordCommunityEventPatchRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordCommunityEventPatchRequestDto()).toBeDefined();
  });
});
