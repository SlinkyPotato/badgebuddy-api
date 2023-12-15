import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import { CommunityEventDiscordEntity, DISCORD_COMMUNITY_EVENTS_QUEUE, DiscordUserEntity } from '@badgebuddy/common';
import { DiscordCommunityEventsActiveService } from '../discord-community-events-active/discord-community-events-active.service';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordCommunityEventsActiveController } from '../discord-community-events-active/discord-community-events-active.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    DiscordModule.forFeature(),
    BullModule.registerQueue({
      name: DISCORD_COMMUNITY_EVENTS_QUEUE,
    }),
    TypeOrmModule.forFeature([
      CommunityEventDiscordEntity,
      DiscordBotSettingsEntity,
      DiscordUserEntity,
    ]),
    AuthModule,
  ],
  controllers: [
    DiscordCommunityEventsActiveController,
  ],
  providers: [
    Logger,
    DiscordCommunityEventsActiveService,
    ValidationPipe,
  ],
})
export class DiscordCommunityEventsActiveModule {}
