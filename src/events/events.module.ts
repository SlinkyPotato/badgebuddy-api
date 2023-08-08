import { Logger, Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PoapEvent, PoapEventSchema } from './schemas/poap-events.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from '../guilds/schemas/discord-guild.schema';
import CacheConfig from '../config/redis.config';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>(CacheConfig),
    MongooseModule.forFeature([
      { name: PoapEvent.name, schema: PoapEventSchema },
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [Logger, EventsService],
})
export class EventsModule {}
