import { DiscordBotPostRequestDto } from './discord-bot-post-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotPostRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordBotPostRequestDto()).toBeDefined();
  });
});
