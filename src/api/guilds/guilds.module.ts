import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from './schemas/discord-guild.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientOptions } from 'redis';
import { CacheModule } from '@nestjs/cache-manager';
import { configureCache } from '../../config/redis.config';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configureCache(configService);
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
    ConfigModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService, Logger],
})
export class GuildsModule {}
