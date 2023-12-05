import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DiscordBotGuildSettingsGetRequestDto } from './dto/discord-bot-guild-settings-get-request.dto';
import { DiscordBotSettingsGetResponseDto } from './dto/discord-bot-settings-get-response.dto';
import { DISCORD_GUILD_BOT_SETTINGS_REPOSITORY, DiscordGuildBotSettingsEntity } from '@badgebuddy/common';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class DiscordBotService {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly logger: Logger,
    @Inject(DISCORD_GUILD_BOT_SETTINGS_REPOSITORY) private botSettingsRepo: Repository<DiscordGuildBotSettingsEntity>,
  ) {}

  setupBotInGuild(createDiscordBotDto: CreateDiscordBotDto) {
    return 'This action adds a new discordBot';
  }

  async getBotSettingsForGuild({ guildId }: DiscordBotGuildSettingsGetRequestDto): Promise<DiscordBotSettingsGetResponseDto> {
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
      guildId: discordBotSettings.guild.guildSId,
      guildName: discordBotSettings.guild.name,
      poapManagerRoleId: discordBotSettings.poapManagerRoleSId,
      privateChannelId: discordBotSettings.privateChannelSId,
      newsChannelId: discordBotSettings.newsChannelSId,
    };
  }

  removeBotFromGuild(id: number) {
    return `This action removes a #${id} discordBot`;
  }
}
