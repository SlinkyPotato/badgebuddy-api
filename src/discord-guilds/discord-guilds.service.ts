import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DiscordGuildEntity } from '@badgebuddy/common';
import { redisHttpKeys } from '../redis-keys.constant';
import DiscordGuildBotSettingsResponseDto from './dto/discord-guild-get-response.dto';
import PostGuildRequestDto from './dto/discord-guild-post-request.dto';
import GuildPostResponseDto from './dto/discord-guild-post-response.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class DiscordGuildsService {
  
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) { }

  async getGuild(id: string): Promise<DiscordGuildBotSettingsResponseDto> {
    this.logger.verbose(`getting guild from db, guildId: ${id}`);
    const discordGuild: DiscordGuildEntity | null = await this.dataSource.createQueryBuilder()
      .select('discord')
      .from(DiscordGuildEntity, 'discord')
      .where('discord.guildId = :guildId', { guildId: id })
      .getOne();
    
    if (!discordGuild) {
      throw new NotFoundException('Guild not found');
    }

    this.logger.verbose(`got guild from db, guildId: ${id}`);

    return {
      id: discordGuild.id.toString(),
      guildId: discordGuild.guildSId,
      guildName: discordGuild.name,
      poapManagerRoleId: discordGuild.poap,
      privateChannelId: discordGuild.p,
      newsChannelId: discordGuild.newsChannelId,
    };
  }

  async addGuild(
    id: string,
    postGuildRequestDto: PostGuildRequestDto,
  ): Promise<GuildPostResponseDto> {
    this.logger.log('registering guild: ' + id);
    const retrievedDiscordServer = await this.discordServerModel
      .findOne({
        guildId: id,
      })
      .exec();

    if (retrievedDiscordServer) {
      throw new ConflictException('Guild already registered');
    }

    const discordGuild: DiscordGuild = new DiscordGuild();
    discordGuild.guildId = id;
    discordGuild.guildName = postGuildRequestDto.guildName;
    discordGuild.poapManagerRoleId = postGuildRequestDto.poapManagerRoleId;
    discordGuild.privateChannelId = postGuildRequestDto.privateChannelId;
    discordGuild.newsChannelId = postGuildRequestDto.newsChannelId;

    const result = await this.discordServerModel.create(discordGuild);
    this.logger.log(`registered guild: ${id}`);
    return {
      _id: result._id.toString(),
    };
  }

  async removeGuild(guildId: string): Promise<void> {
    this.logger.log(`removing guild: ${guildId}`);
    const result = await this.discordServerModel
      .findOneAndDelete({
        guildId: guildId,
      })
      .exec();
    if (result == null) {
      throw new NotFoundException('Guild not found');
    }
    this.logger.log(`removing guild from cache: ${guildId}`);
    await this.cacheManager.del(redisHttpKeys.GUILDS(guildId));
    this.logger.log(`removed guild from cache: ${guildId}`);
  }

}
