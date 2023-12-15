import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client, GuildMember } from 'discord.js';
import { DISCORD_BOT_SETTINGS_GUILDSID, DiscordBotTokenDto, UserTokenDto } from '@badgebuddy/common';
import { Repository } from 'typeorm';
import {
  DiscordBotSettingsGetResponseDto,
} from '@badgebuddy/common';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ProcessorTokenGuard } from '@/auth/guards/processor-token/processor-token.guard';
import { DiscordBotTokenGuard } from '@/auth/guards/discord-bot-token/discord-bot-token.guard';
import { UserTokenGuard } from '@/auth/guards/user-token/user-token.guard';

/**
 * Auth guard to authenticate users based on whether they are a POAP manager.
 * @see https://docs.nestjs.com/guards
 */
@Injectable()
export class PoapManagerGuard implements CanActivate {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(DiscordBotSettingsEntity) private discordBotSettingsRepo: Repository<DiscordBotSettingsEntity>,
    @InjectDiscordClient() private readonly discordClient: Client,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly processorTokenGuard: ProcessorTokenGuard,
    private readonly userTokenGuard: UserTokenGuard,
    private readonly discordBotTokenGuard: DiscordBotTokenGuard,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    if (await this.processorTokenGuard.canActivate(context)) {
      return true;
    }

    if (
      !await this.userTokenGuard.canActivate(context) && 
      !await this.discordBotTokenGuard.canActivate(context)
    ) {
      return false;
    }
    
    const accessToken = context.switchToHttp().getRequest().headers['authorization'].split(' ')[1];
    const decodedToken: DiscordBotTokenDto | UserTokenDto = this.jwtService.decode<DiscordBotTokenDto | UserTokenDto>(accessToken);
    const organizerSId = decodedToken.discordUserSId;

    if (!organizerSId) {
      this.logger.warn(
        `Auth request rejected. Missing discordUserSId. discordUserSId: ${organizerSId}`,
      );
      throw new UnauthorizedException('Missing discordUserSId');
    }

    const { guildSId } = context.switchToHttp().getRequest().body;

    if (!guildSId) {
      this.logger.warn(
        `Auth request rejected. Missing guildSId or organizerSId. guildSId: ${guildSId}}`,
      );
      throw new UnauthorizedException('Missing guildSId or organizerSId');
    }

    this.logger.log(
      `Checking auth request for guildSId: ${guildSId}`
    );

    let poapManagerRoleSId: string | undefined;
    const botSettingsCache = await this.getBotSettingsFromCache(guildSId);
    let botSettingsDb: DiscordBotSettingsEntity | null = null;

    if (botSettingsCache) {
      poapManagerRoleSId = botSettingsCache.poapManagerRoleId;
      this.logger.verbose(`found poapManagerRoleSId in cache for guildSId: ${guildSId}, poapManagerRoleSId: ${poapManagerRoleSId}`)
    }

    if (!botSettingsCache) {
      this.logger.verbose(`Bot settings not found in cache for guildSId: ${guildSId}, attempting to pull from db`);
      botSettingsDb = await this.getBotSettingsFromDb(guildSId);

      if (botSettingsDb) {
        poapManagerRoleSId = botSettingsDb.poapManagerRoleSId;
        this.logger.verbose(`poapManagerRoleSId found in db for guildSId: ${guildSId}, poapManagerRoleSId: ${poapManagerRoleSId}`);
        this.storeBotSettingsInCache(botSettingsDb);
      }
    }

    if (!poapManagerRoleSId) {
      this.logger.warn(
        `Auth request rejected. Guild not found in cache or db for guildSId: ${guildSId}`,
      );
      return false;
    }

    try {
      const guildMember = await this.fetchGuildMember(guildSId, organizerSId);
      this.logger.verbose(`Guild member found for guildSId: ${guildSId} and organizerSId: ${organizerSId}`);
      if (!guildMember.roles.cache.has(poapManagerRoleSId)) {
        this.logger.warn(
          `Auth request rejected. User is not a POAP manager for organizerId: ${organizerSId}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch guildSId: ${guildSId}, organizerSId: ${organizerSId}`,
        error,
      );
      return false;
    }
    this.logger.log(
      `Auth request accepted for guildSId: ${guildSId} and organizerSId: ${organizerSId}`,
    );
    return true;
  }

  private async storeBotSettingsInCache(botSettings: DiscordBotSettingsEntity) {
    return this.cacheManager.set(
      DISCORD_BOT_SETTINGS_GUILDSID(botSettings.guildSId),
      {
        id: botSettings.id,
        guildSId: botSettings.guildSId,
        guildName: botSettings.name,
        poapManagerRoleId: botSettings.poapManagerRoleSId,
        privateChannelId: botSettings.privateChannelSId,
        newsChannelId: botSettings.newsChannelSId,
      } as DiscordBotSettingsGetResponseDto,
    ).then(() => {
      this.logger.verbose(`Bot settings stored in cache for guildSId: ${botSettings.guildSId}`);
    }).catch((error) => {
      this.logger.error(`Failed to store bot settings in cache for guildSId: ${botSettings.guildSId}`, error);
    });
  }

  private async getBotSettingsFromCache(guildSId: string) {
    return this.cacheManager.get<DiscordBotSettingsGetResponseDto>(
      DISCORD_BOT_SETTINGS_GUILDSID(guildSId),
    );
  }

  private async getBotSettingsFromDb(guildSId: string) {
    return await this.discordBotSettingsRepo.findOne({
      where: {
        guildSId: guildSId,
      },
    });
  }

  private async fetchGuildMember(guildSId: string, organizerSId: string): Promise<GuildMember> {
    return (await this.discordClient.guilds.fetch(guildSId)).members.fetch(organizerSId);
  }

}
