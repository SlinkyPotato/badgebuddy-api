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
import { Model } from 'mongoose';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import CommonRequest from '../dto/common-request.interface';
import { DiscordGuild } from '@solidchain/badge-buddy-common';

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
    this.logger.log(
      `Checking auth request for guildId: ${guildId} and organizerId: ${organizerId}`,
    );
    let guild: DiscordGuild | undefined | null = await this.cacheManager.get(
      '/guilds/' + guildId,
    );

    if (!guild) {
      guild = await this.guildModel.findOne({
        guildId: guildId,
      });
    }

    if (!guild) {
      this.logger.error(
        `Auth request rejected. Guild not found for guildId: ${guildId}`,
      );
      return false;
    }

    if (guild.poapManagerRoleId) {
      try {
        const guildMember = await (
          await this.discordClient.guilds.fetch(guild.guildId)
        ).members.fetch(organizerId);
        if (!guildMember.roles.cache.has(guild.poapManagerRoleId)) {
          this.logger.error(
            `Auth request rejected. User is not a POAP manager for organizerId: ${organizerId}`,
          );
          return false;
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch guildId: ${guildId}, organizerId: ${organizerId}`,
          error,
        );
        return false;
      }
    }
    this.logger.log(
      `Auth request accepted for guildId: ${guildId} and organizerId: ${organizerId}`,
    );
    return true;
  }
}
