import { DiscordBotGuildSettingsGetRequestDto } from './discord-bot-guild-settings-get-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotSettingsGetRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordBotGuildSettingsGetRequestDto()).toBeDefined();
  });
});
