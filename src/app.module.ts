import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordEventsModule } from './discord-events/discord-events.module';
import DiscordConfig from './config/discord.config';
import MongoConfig from './config/mongo.config';
import SystemConfig from './config/system.config';
import RedisConfig from './config/redis.config';
import { DiscordModule, DiscordModuleOption } from '@discord-nestjs/core';
import { GatewayIntentBits, Partials } from 'discord.js';
import { ApiModule } from './api/api.module';
import LogtailConfig from './config/logtail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      load: [
        MongoConfig,
        DiscordConfig,
        SystemConfig,
        RedisConfig,
        LogtailConfig,
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<any, true>) => ({
        uri: configService.get('mongo.uri'),
      }),
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
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
    }),
    DiscordEventsModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [Logger, AppService],
})
export class AppModule {}
