import { DiscordBotPostResponseDto } from './discord-bot-post-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotPostResponseDto', () => {
  it('should be defined', () => {
    expect(new DiscordBotPostResponseDto()).toBeDefined();
  });
});
