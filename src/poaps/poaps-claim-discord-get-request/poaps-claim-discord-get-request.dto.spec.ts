import { PoapsClaimDiscordGetRequestDto } from './poaps-claim-discord-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('PoapsClaimDiscordGetRequestDto', () => {
  it('should be defined', () => {
    expect(new PoapsClaimDiscordGetRequestDto()).toBeDefined();
  });
});
