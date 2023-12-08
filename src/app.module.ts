import { Module } from '@nestjs/common';
import {
  CommonConfigModule,
  RedisConfigModule,
  RedisBullConfigModule,
  DiscordConfigModule,
  CommonTypeOrmModule,
} from '@badgebuddy/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DiscordBotModule } from './discord-bot/discord-bot.module';
import { DiscordCommunityEventsModule } from './discord-community-events/discord-community-events.module';

@Module({
  imports: [
    CommonTypeOrmModule.forRootAsync(),
    CommonConfigModule.forRoot(),
    RedisConfigModule.forRootAsync(),
    RedisBullConfigModule.forRootAsync(),
    DiscordConfigModule.forRootAsync(),
    HealthModule,
    AuthModule,
    DiscordBotModule,
    DiscordCommunityEventsModule,
  ],
})
export class AppModule { }
