import { LoginDiscordPostRequestDto } from './login-discord-post-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('LoginDiscordPostRequestDto', () => {
  it('should be defined', () => {
    expect(new LoginDiscordPostRequestDto()).toBeDefined();
  });
});
