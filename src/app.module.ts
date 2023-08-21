import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordEventsModule } from './discord-events/discord-events.module';
import { DiscordModule, DiscordModuleOption } from '@discord-nestjs/core';
import { GatewayIntentBits, Partials } from 'discord.js';
import { ApiModule } from './api/api.module';
import { EnvConfig, validationSchema } from '@solidchain/badge-buddy-common';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      load: [EnvConfig],
      validationSchema: validationSchema(),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<{ MONGODB_URI: string }, true>,
      ) => ({
        uri: configService.get('MONGODB_URI', { infer: true }),
      }),
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<{ DISCORD_BOT_TOKEN: string }, true>,
      ): Promise<DiscordModuleOption> | DiscordModuleOption => ({
        token: configService.get('DISCORD_BOT_TOKEN', { infer: true }),
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
