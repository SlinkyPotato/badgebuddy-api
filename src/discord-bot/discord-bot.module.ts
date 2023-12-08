import { Logger, Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { CommonTypeOrmModule } from '@badgebuddy/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    DiscordModule.forFeature(),
    ConfigModule,
    CommonTypeOrmModule,
    TypeOrmModule.forFeature([DiscordBotSettingsEntity]),
  ],
  controllers: [DiscordBotController],
  providers: [
    DiscordBotService,
    Logger,
    AuthService,
  ],
})
export class DiscordBotModule {}
