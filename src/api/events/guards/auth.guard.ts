import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordGuild } from '../../guilds/schemas/discord-guild.schema';
import { Model } from 'mongoose';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import CommonRequest from '../dto/common-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(DiscordGuild.name) private guildModel: Model<DiscordGuild>,
    @InjectDiscordClient() private readonly discordClient: Client,
    private readonly logger: Logger,
  ) {}

  async canActivate<T extends CommonRequest>(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: T = context.switchToHttp().getRequest().body;
    const guildId = request.guildId;
    const organizerId = request.organizerId;

    let guild: DiscordGuild | undefined | null = await this.cacheManager.get(
      '/guilds/' + guildId,
    );

    if (!guild) {
      guild = await this.guildModel.findOne({
        guildId: guildId,
      });
    }

    if (!guild) {
      return false;
    }

    if (guild.poapManagerRoleId) {
      try {
        const guildMember = await (
          await this.discordClient.guilds.fetch(guild.guildId)
        ).members.fetch(organizerId);
        if (!guildMember.roles.cache.has(guild.poapManagerRoleId)) {
          return false;
        }
      } catch (error) {
        this.logger.log(`Failed to fetch guild member: ${error}`);
        return false;
      }
    }

    return true;
  }
}
