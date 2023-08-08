import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from './schemas/discord-guild.schema';
import { ConfigModule } from '@nestjs/config';
import { RedisClientOptions } from 'redis';
import { CacheModule } from '@nestjs/cache-manager';
import CacheConfig from '../config/redis.cache';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>(CacheConfig),
    MongooseModule.forFeature([
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
    ConfigModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService, Logger],
  // providers: [GuildsService, Logger, { provide: 'APM', useValue: apm }],
})
export class GuildsModule {}
