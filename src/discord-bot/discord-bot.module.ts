import { Logger, Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { CommonTypeOrmModule, TokenEntity } from '@badgebuddy/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    DiscordModule.forFeature(),
    ConfigModule,
    CommonTypeOrmModule,
    HttpModule,
    TypeOrmModule.forFeature([
      DiscordBotSettingsEntity,
      TokenEntity,
    ]),
    AuthModule,
  ],
  controllers: [DiscordBotController],
  providers: [
    DiscordBotService,
    Logger,
  ],
})
export class DiscordBotModule {}
