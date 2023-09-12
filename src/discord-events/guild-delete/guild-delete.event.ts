import { Injectable, Logger } from '@nestjs/common';
import { On } from '@discord-nestjs/core';
import { Guild } from 'discord.js';
import { GuildsService } from '../../api/guilds/guilds.service';

@Injectable()
export class GuildDeleteEvent {
  constructor(
    private readonly logger: Logger,
    private guildsApiService: GuildsService,
  ) {}

  @On('guildDelete')
  onGuild(guild: Guild): void {
    this.logger.log(`guild left, guildId: ${guild.id}, name: ${guild.name}`);
    this.guildsApiService.remove(guild.id.toString()).catch((err) => {
      this.logger.error(err);
    });
  }
}
