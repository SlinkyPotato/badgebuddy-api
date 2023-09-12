import { Logger, Module } from '@nestjs/common';
import { GuildDeleteEvent } from './guild-delete.event';
import { GuildsModule } from '../../api/guilds/guilds.module';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [DiscordModule.forFeature(), GuildsModule],
  providers: [GuildDeleteEvent, Logger],
})
export class GuildDeleteModule {}
