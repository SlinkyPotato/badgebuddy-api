import { LoginDiscordPostResponseDto } from './login-discord-post-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('LoginDiscordPostResponseDto', () => {
  it('should be defined', () => {
    expect(new LoginDiscordPostResponseDto()).toBeDefined();
  });
});
