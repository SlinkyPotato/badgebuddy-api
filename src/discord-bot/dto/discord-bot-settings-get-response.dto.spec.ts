import { DiscordBotSettingsGetResponseDto } from './discord-bot-settings-get-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotSettingsGetResponseDto', () => {
  it('should be defined', () => {
    expect(new DiscordBotSettingsGetResponseDto()).toBeDefined();
  });
});
