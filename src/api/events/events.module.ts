import { Logger, Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from '../guilds/schemas/discord-guild.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordModule } from '@discord-nestjs/core';
import { configureCache } from '../../config/redis.config';
import {
  CommunityEvent,
  CommunityEventSchema,
} from './schemas/community-event.schema';

@Module({
  imports: [
    DiscordModule.forFeature(),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<any, true>) => {
        return configureCache(configService);
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: CommunityEvent.name, schema: CommunityEventSchema },
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [Logger, EventsService],
})
export class EventsModule {}
