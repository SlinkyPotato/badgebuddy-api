import { Module } from '@nestjs/common';
import {
  CommonConfigModule,
  RedisConfigModule,
  RedisBullConfigModule,
  MongooseConfigModule,
  DiscordConfigModule,
  CommonTypeOrmModule,
} from '@badgebuddy/common';
import { AuthModule } from './auth/auth.module';
import { DiscordEventsModule } from './community-events/discord-events.module';
import { HealthModule } from './health/health.module';
import { DiscordBotModule } from './discord-bot/discord-bot.module';

@Module({
  imports: [
    CommonTypeOrmModule.forRootAsync(),
    CommonConfigModule.forRoot(),
    RedisConfigModule.forRootAsync(),
    RedisBullConfigModule.forRootAsync(),
    MongooseConfigModule.forRootAsync(),
    DiscordConfigModule.forRootAsync(),
    AuthModule,
    DiscordBotModule,
    DiscordEventsModule,
    HealthModule,
    DiscordBotModule,
  ],
})
export class AppModule { }
