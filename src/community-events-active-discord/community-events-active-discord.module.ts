import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import {
  CommunityEventDiscordEntity,
  DISCORD_COMMUNITY_EVENTS_QUEUE,
  DiscordUserEntity,
} from '@badgebuddy/common';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { CommunityEventsActiveDiscordService } from '@/community-events-active-discord/community-events-active-discord.service';
import { CommunityEventsActiveDiscordController } from '@/community-events-active-discord/community-events-active-discord.controller';

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
  controllers: [CommunityEventsActiveDiscordController],
  providers: [Logger, CommunityEventsActiveDiscordService, ValidationPipe],
})
export class CommunityEventsActiveDiscordModule {}
