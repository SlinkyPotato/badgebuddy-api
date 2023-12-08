import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import { CommunityEventDiscordEntity, DISCORD_COMMUNITY_EVENTS_QUEUE, DiscordUserEntity } from '@badgebuddy/common';
import { PoapManagerGuard } from './guards/poap-manager.guard';
import { DiscordCommunityEventsManagementController } from './discord-community-events-management.controller';
import { DiscordActiveCommunityEventsService } from './discord-active-community-events.service';
import { DiscordCommunityEventsManagementService } from './discord-community-events-management.service';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordCommunityEventsActiveController } from './discord-community-events-active.controller';

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
  ],
  controllers: [
    DiscordCommunityEventsActiveController,
    DiscordCommunityEventsManagementController
  ],
  providers: [
    Logger,
    DiscordCommunityEventsManagementService,
    DiscordActiveCommunityEventsService,
    ValidationPipe,
    PoapManagerGuard,
  ],
})
export class DiscordCommunityEventsModule {}
