import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from './schemas/discord-guild.schema';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { CacheModule } from '@nestjs/cache-manager';

let cacheConfig;
switch (process.env.NODE_ENV) {
  case 'production':
    cacheConfig = {
      store: redisStore,
      socket: {
        path: '/app/redis/redis.sock',
      },
      database: 0,
      ttl: 1000 * 60 * 60 * 24, // 1 day
    };
    break;
  case 'staging':
    cacheConfig = {
      store: redisStore,
      socket: {
        path: '/app/redis/redis.sock',
      },
      database: 1,
      ttl: 1000 * 60 * 60, // 1 hour
    };
    break;
  default:
    cacheConfig = {
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
      database: 0,
      ttl: 1000 * 60, // 1 minute
    };
}

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>(cacheConfig),
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
