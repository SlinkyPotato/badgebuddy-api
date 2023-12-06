import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { DISCORD_BOT_SETTINGS_GUILDSID } from '@badgebuddy/common';
import { Repository } from 'typeorm';
import { CommonManagementRequestDto } from '../dto/common-management-request.dto';
import { DiscordBotSettingsGetResponseDto } from 'src/discord-bot/dto/discord-bot-settings-get-response.dto';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Auth guard to authenticate users based on whether they are a POAP manager.
 * @see https://docs.nestjs.com/guards
 */
@Injectable()
export class PoapManagerGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(DiscordBotSettingsEntity) private discordBotSetttingsRepo: Repository<DiscordBotSettingsEntity>,
    @InjectDiscordClient() private readonly discordClient: Client,
    private readonly logger: Logger,
  ) { }

  async canActivate<T extends CommonManagementRequestDto>(
    context: ExecutionContext,
  ): Promise<boolean> {
    this.logger.verbose('Pulling request from auth guard');
    const { guildSId, organizerSId }: T = context.switchToHttp().getRequest().body;

    this.logger.verbose(
      `Checking auth request for guildId: ${guildSId} and organizerId: ${organizerSId}`
    );
    
    let poapManagerRoleSId: string | undefined;
    const botSettingsCache = await this.cacheManager.get<DiscordBotSettingsGetResponseDto>(DISCORD_BOT_SETTINGS_GUILDSID(guildSId));
    let botSettingsDb: DiscordBotSettingsEntity | null = null;

    if (botSettingsCache) {
      poapManagerRoleSId = botSettingsCache.poapManagerRoleId;
    }

    if (!botSettingsCache) {
      this.logger.verbose(`Bot settings not found in cache for guildId: ${guildSId}, attempting to pull from db`);
      botSettingsDb = await this.discordBotSetttingsRepo.findOne({
        where: {
          guildSId: guildSId,
        },
      });
      if (botSettingsDb) {
        poapManagerRoleSId = botSettingsDb.poapManagerRoleSId;
      }
    }

    if (!poapManagerRoleSId) {
      this.logger.error(
        `Auth request rejected. Guild not found in cache or db for guildId: ${guildSId}`,
      );
      return false;
    }
    

    try {
      const guildMember = await (
        await this.discordClient.guilds.fetch(guildSId)
      ).members.fetch(organizerSId);

      if (!guildMember.roles.cache.has(poapManagerRoleSId)) {
        this.logger.error(
          `Auth request rejected. User is not a POAP manager for organizerId: ${organizerSId}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch guildId: ${guildSId}, organizerId: ${organizerSId}`,
        error,
      );
      return false;
    }
    this.logger.verbose(
      `Auth request accepted for guildId: ${guildSId} and organizerId: ${organizerSId}`,
    );
    return true;
  }
}
