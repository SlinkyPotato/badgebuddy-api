import { ConflictException, Inject, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DiscordBotSettingsGetResponseDto } from './dto/discord-bot-settings-get-response.dto';
import { DISCORD_GUILD_BOT_SETTINGS_REPOSITORY, DiscordGuildBotSettingsEntity } from '@badgebuddy/common';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DiscordBotPostResponseDto } from './dto/discord-bot-post-response.dto';
import { DiscordBotPostRequestDto } from './dto/discord-bot-post-request.dto';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { redisHttpKeys } from 'src/redis-keys.constant';
import { Cache } from 'cache-manager';

@Injectable()
export class DiscordBotService {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly logger: Logger,
    @Inject(DISCORD_GUILD_BOT_SETTINGS_REPOSITORY) private botSettingsRepo: Repository<DiscordGuildBotSettingsEntity>,
    @InjectDiscordClient() private readonly discordClient: Client,
  ) {}

  async getBotSettingsForGuild(
    guildId: string
  ): Promise<DiscordBotSettingsGetResponseDto> {
    this.logger.verbose(`getting guild from db, guildId: ${guildId}`);
    const discordBotSettings = await this.botSettingsRepo.findOne({
      relations: {
        guild: true,
      },
      where: {
        guild: {
          guildSId: guildId,
        },
      }
    })
    if (!discordBotSettings) {
      throw new NotFoundException('Guild not found');
    }
    this.logger.verbose(`got guild from db, guildId: ${guildId}`);
    return {
      id: discordBotSettings.id.toString(),
      guildSId: discordBotSettings.guild.guildSId,
      guildName: discordBotSettings.guild.name,
      poapManagerRoleId: discordBotSettings.poapManagerRoleSId,
      privateChannelId: discordBotSettings.privateChannelSId,
      newsChannelId: discordBotSettings.newsChannelSId,
    };
  }

  async addBotToGuild(
    request: DiscordBotPostRequestDto
  ): Promise<DiscordBotPostResponseDto> {
    this.logger.verbose(`settings up bot in guild: ${request.guildSId}`);
    const botSettings = await this.botSettingsRepo.findOne({
      relations: {
        guild: true,
      },
      where: {
        guild: {
          guildSId: request.guildSId,
        },
      }
    });

    if (botSettings) {
      throw new ConflictException('Discord bot already exists');
    }

    const discordGuild = await this.discordClient.guilds.fetch(request.guildSId);

    if (!discordGuild) {
      throw new UnprocessableEntityException('Invalid guildId');
    }

    const newBotSettings: DiscordGuildBotSettingsEntity = {
      guild: {
        guildSId: request.guildSId,
        name: discordGuild.name,
        nsfwLevel: discordGuild.nsfwLevel,
        ownerSid: discordGuild.ownerId,
        description: discordGuild.description ?? undefined,
      },
      poapManagerRoleSId: request.poapManagerRoleId,
      privateChannelSId: request.privateChannelId,
      newsChannelSId: request.newsChannelId,
    } as DiscordGuildBotSettingsEntity;

    let result;
    try {
      result = await this.botSettingsRepo.save(newBotSettings);
    } catch(err) {
      this.logger.error('failed to insert discord bot settings', err);
      throw new UnprocessableEntityException('Invalid guildId');
    }

    this.logger.debug(`bot added to guild: ${request.guildSId}`);
    return {
      discordBotSettingsId: result.id,
    };
  }

  async removeBotFromGuild(guildId: string, botSettingsId?: string) {
    this.logger.log(`removing discord bot from guild: ${guildId}`);
    
    this.logger.verbose(`removing guild from cache: ${guildId}`);
    await this.cacheManager.del(redisHttpKeys.GUILDS(guildId));
    this.logger.verbose(`removed guild from cache: ${guildId}`);

    if (botSettingsId) {
      this.logger.verbose(`removing bot settings: ${botSettingsId}`)
      const result = await this.botSettingsRepo.delete({
        id: botSettingsId,
      });
      if (result.affected === 0) {
        throw new NotFoundException('Bot settings not found');
      }
      this.logger.log(`removed bot settings: ${botSettingsId}`)
      return;
    }

    const result = await this.botSettingsRepo.delete({
      guild: {
        guildSId: guildId,
      },
    });
    if (result.affected === 0) {
      throw new NotFoundException('Bot settings not found');
    }
    this.logger.log(`removed bot settings: ${guildId}`)
  }
}
