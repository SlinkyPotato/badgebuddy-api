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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(DiscordGuild.name) private guildModel: Model<DiscordGuild>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let guild: DiscordGuild | undefined | null = await this.cacheManager.get(
      '/guilds/' + request.params.guildId,
    );

    if (!guild) {
      guild = await this.guildModel.findOne({
        guildId: request.params.guildId,
      });
    }

    if (!guild) {
      return false;
    }

    if (guild.poapManagerRoleId) {
      const member = await request.discordClient.guilds.cache
        .get(request.params.guildId)
        .members.fetch(request.user.id);

      if (member.roles.cache.has(guild.poapManagerRoleId)) {
        return true;
      }
    }

    return true;
  }
}
