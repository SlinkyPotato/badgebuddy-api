import { PoapsClaimDiscordGetResponseDto } from './poaps-claim-discord-get-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('PoapsClaimDiscordGetResponseDto', () => {
  it('should be defined', () => {
    expect(new PoapsClaimDiscordGetResponseDto()).toBeDefined();
  });
});
