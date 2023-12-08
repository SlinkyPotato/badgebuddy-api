import { AuthorizeDiscordGetResponseDto } from './authorize-discord-get-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('AuthorizeDiscordGetResponseDto', () => {
  it('should be defined', () => {
    expect(new AuthorizeDiscordGetResponseDto()).toBeDefined();
  });
});
