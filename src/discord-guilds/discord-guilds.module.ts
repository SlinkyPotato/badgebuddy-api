import { Logger, Module } from '@nestjs/common';
import { DiscordGuildsService } from './discord-guilds.service';
import { GuildController } from './guild.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [GuildController],
  providers: [DiscordGuildsService, Logger],
})
export class DiscordGuildsModule {}
