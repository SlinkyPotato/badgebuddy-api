import { DiscordBotDeleteRequestDto } from './discord-bot-delete-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotDeleteRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordBotDeleteRequestDto()).toBeDefined();
  });
});
