import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import {
  CommunityEventDiscordEntity,
  DISCORD_COMMUNITY_EVENTS_QUEUE,
  DiscordUserEntity,
} from '@badgebuddy/common';
import { CommunityEventsManageDiscordController } from './community-events-manage-discord.controller';
import { CommunityEventsManageDiscordService } from './community-events-manage-discord.service';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { PoapsService } from '@/poaps/poaps.service';
import { HttpModule } from '@nestjs/axios';

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
    HttpModule,
  ],
  controllers: [CommunityEventsManageDiscordController],
  providers: [
    Logger,
    CommunityEventsManageDiscordService,
    ValidationPipe,
    PoapsService,
  ],
})
export class CommunityEventsManageDiscordModule {}
