import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import { CommunityEventDiscordEntity, DISCORD_COMMUNITY_EVENTS_QUEUE, DiscordUserEntity } from '@badgebuddy/common';
import { PoapManagerGuard } from './guards/poap-manager.guard';
import { DiscordCommunityEventsManageController } from './discord-community-events-manage.controller';
import { DiscordCommunityEventsManageService } from './discord-community-events-manage.service';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
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
  controllers: [
    DiscordCommunityEventsManageController
  ],
  providers: [
    Logger,
    DiscordCommunityEventsManageService,
    ValidationPipe,
    PoapManagerGuard,
  ],
})
export class DiscordCommunityEventsManageModule {}
