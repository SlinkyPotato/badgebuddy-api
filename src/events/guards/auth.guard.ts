import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordGuild } from '../../guilds/schemas/discord-guild.schema';
import { Model } from 'mongoose';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import PostEventRequestDto from '../dto/post/event.request.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(DiscordGuild.name) private guildModel: Model<DiscordGuild>,
    @InjectDiscordClient() private readonly discordClient: Client,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: PostEventRequestDto = context
      .switchToHttp()
      .getRequest().body;

    let guild: DiscordGuild | undefined | null = await this.cacheManager.get(
      '/guilds/' + request.guildId,
    );

    if (!guild) {
      guild = await this.guildModel.findOne({
        guildId: request.guildId,
      });
    }

    if (!guild) {
      return false;
    }

    if (guild.poapManagerRoleId) {
      const guildMember = await (
        await this.discordClient.guilds.fetch(guild.guildId)
      ).members.fetch(request.organizerId);

      if (!guildMember.roles.cache.has(guild.poapManagerRoleId)) {
        return false;
      }
    }

    return true;
  }
}
