import { DiscordBotPermissionsPatchRequestDto } from './discord-bot-permissions-patch-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('DiscordBotPermissionsPatchRequestDto', () => {
  it('should be defined', () => {
    expect(new DiscordBotPermissionsPatchRequestDto()).toBeDefined();
  });
});
