import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GuildsModule } from './guilds/guilds.module';
import { DiscordEventsModule } from './discord-events/discord-events.module';
import DiscordConfig from './config/discord.config';
import MongoConfig from './config/mongo.config';
import SystemConfig from './config/system.config';
import RedisConfig from './config/redis.config';
import { DiscordModule, DiscordModuleOption } from '@discord-nestjs/core';
import { GatewayIntentBits, Partials } from 'discord.js';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      load: [MongoConfig, DiscordConfig, SystemConfig, RedisConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<any, true>) => ({
        uri: configService.get('mongo.uri'),
      }),
      inject: [ConfigService],
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService<any, true>,
      ): Promise<DiscordModuleOption> | DiscordModuleOption => ({
        token: configService.get('discord.token'),
        discordClientOptions: {
          // TODO: Reduce and compact the intents
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.MessageContent,
          ],
          partials: [
            Partials.Message,
            Partials.Channel,
            Partials.Reaction,
            Partials.User,
          ],
        },
        failOnLogin: true,
      }),
      inject: [ConfigService],
    }),
    EventsModule,
    GuildsModule,
    DiscordEventsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [Logger, AppService],
})
export class AppModule {}
