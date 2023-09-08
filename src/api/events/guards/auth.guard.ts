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
import { DiscordGuild } from '@solidchain/badge-buddy-common';
import CommonRequestDto from '../dto/common-request.dto';
import { redisHttpKeys } from '../../redis-keys.constant';
import GetGuildResponseDto from '../../guilds/dto/get/guild.response.dto';

/**
 * Auth guard to authenticate users based on whether they are a POAP manager.
 * @see https://docs.nestjs.com/guards
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(DiscordGuild.name) private guildModel: Model<DiscordGuild>,
    @InjectDiscordClient() private readonly discordClient: Client,
    private readonly logger: Logger,
  ) {}

  async canActivate<T extends CommonRequestDto>(
    context: ExecutionContext,
  ): Promise<boolean> {
    this.logger.verbose('Pulling request from auth guard');
    const request: T = context.switchToHttp().getRequest().body;
    const guildId = request.guildId;
    const organizerId = request.organizerId;
    this.logger.verbose(
      `Checking auth request for guildId: ${guildId} and organizerId: ${organizerId}`,
    );
    let guild: GetGuildResponseDto | DiscordGuild | undefined | null =
      await this.cacheManager.get(redisHttpKeys.GUILDS(guildId));

    if (!guild) {
      this.logger.verbose(
        `Guild not found in cache for guildId: ${guildId}, attempting to pull from db`,
      );
      guild = await this.guildModel.findOne({
        guildId: guildId,
      });
    }

    if (!guild) {
      this.logger.error(
        `Auth request rejected. Guild not found in cache or db for guildId: ${guildId}`,
      );
      return false;
    }

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
    this.logger.verbose(
      `Auth request accepted for guildId: ${guildId} and organizerId: ${organizerId}`,
    );
    return true;
  }
}
