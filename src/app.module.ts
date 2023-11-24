import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import {
  CommonConfigModule,
  RedisConfigModule,
  RedisBullConfigModule,
  MongooseConfigModule,
  DiscordConfigModule,
  CommonTypeOrmModule,
} from '@badgebuddy/common';
import { DiscordEventsModule } from './discord-events/discord-events.module';

@Module({
  imports: [
    CommonTypeOrmModule.forRootAsync(),
    CommonConfigModule.forRoot(),
    RedisConfigModule.forRootAsync(),
    RedisBullConfigModule.forRootAsync(),
    MongooseConfigModule.forRootAsync(),
    DiscordConfigModule.forRootAsync(),
    ApiModule,
    DiscordEventsModule,
  ],
})
export class AppModule { }
