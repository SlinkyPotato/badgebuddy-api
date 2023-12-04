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
import { EventsModule } from './discord-events/events.module';
import { DiscordGuildsModule } from './discord-guilds/discord-guilds.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    CommonTypeOrmModule.forRootAsync(),
    CommonConfigModule.forRoot(),
    RedisConfigModule.forRootAsync(),
    RedisBullConfigModule.forRootAsync(),
    MongooseConfigModule.forRootAsync(),
    DiscordConfigModule.forRootAsync(),
    AuthModule,
    EventsModule,
    DiscordGuildsModule,
    HealthModule,
  ],
})
export class AppModule { }
