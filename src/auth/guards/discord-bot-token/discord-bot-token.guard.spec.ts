import { DiscordBotTokenGuard } from './discord-bot-token.guard';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotGuard', () => {
  it('should be defined', () => {
    expect(new DiscordBotTokenGuard()).toBeDefined();
  });
});
