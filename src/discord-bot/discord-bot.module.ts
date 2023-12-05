import { Logger, Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { DiscordGuildBotSettingsRepositoryProvider } from '@badgebuddy/common';

@Module({
  controllers: [DiscordBotController],
  providers: [
    DiscordBotService,
    Logger,
    DiscordGuildBotSettingsRepositoryProvider,
  ],
})
export class DiscordBotModule {}
