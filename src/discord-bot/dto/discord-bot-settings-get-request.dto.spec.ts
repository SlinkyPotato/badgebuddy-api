import { DiscordBoSettingsGetRequestDto } from './discord-bot-settings-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotSettingsGetRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordBoSettingsGetRequestDto()).toBeDefined();
  });
});
