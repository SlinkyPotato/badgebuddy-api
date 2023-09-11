import { Injectable, Logger } from '@nestjs/common';
import { On } from '@discord-nestjs/core';
import { Guild } from 'discord.js';
import { GuildCreateService } from './guild-create.service';

@Injectable()
export class GuildCreateEvent {
  constructor(
    private readonly logger: Logger,
    private guildCreateService: GuildCreateService,
  ) {}

  @On('guildCreate')
  async onGuildCreate(guild: Guild): Promise<void> {
    this.logger.log(`guild joined, guildId: ${guild.id}, name: ${guild.name}`);
    this.guildCreateService.setup(guild).catch((err) => {
      this.logger.error(err);
    });
  }
}
