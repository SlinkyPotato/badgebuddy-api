import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DiscordBotSettingsGetResponseDto } from './dto/discord-bot-settings-get-response.dto';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DiscordBotPostResponseDto } from './dto/discord-bot-post-response.dto';
import { DiscordBotPostRequestDto } from './dto/discord-bot-post-request.dto';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { ChannelType, Client, Colors, Guild, NewsChannel, PermissionsBitField, Role, TextChannel } from 'discord.js';
import { Cache } from 'cache-manager';
import { 
  DISCORD_BOT_SETTINGS, DISCORD_BOT_SETTINGS_GUILDSID, DISCORD_BOT_SETTINGS_REPOSITORY 
} from '@badgebuddy/common';
import { ConfigService } from '@nestjs/config';
import { DiscordBotDeleteRequestDto } from './dto/discord-bot-delete-request.dto';
import { DiscordBoSettingsGetRequestDto } from './dto/discord-bot-settings-get-request.dto';
import { DiscordBotSettingsEntity } from '@badgebuddy/common/dist/common-typeorm/entities/discord/discord-bot-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DiscordBotService {

  private readonly allowedPermissions = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessagesInThreads,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.AttachFiles,
    PermissionsBitField.Flags.CreatePrivateThreads,
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.ManageThreads,
    PermissionsBitField.Flags.UseApplicationCommands,
  ] as const;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
    @InjectRepository(DiscordBotSettingsEntity) private botSettingsRepo: Repository<DiscordBotSettingsEntity>,
    @InjectDiscordClient() private readonly discordClient: Client,
    private configService: ConfigService,
  ) {}

  /**
   * Retrieve discord bot settings by guildSId or botSettingsId
   * @param guildSId guild snowflake ID
   * @param botSettingsId discord bot settings ID
   * @returns Promise<DiscordBotSettingsGetResponseDto>
   */
  async getBotSettingsForGuild(
    { guildSId, botSettingsId }: DiscordBoSettingsGetRequestDto,
  ): Promise<DiscordBotSettingsGetResponseDto> {
    this.logger.log(`getting guild from db, guildSId: ${guildSId}, botSettingsId: ${botSettingsId}`);
    let result: DiscordBotSettingsEntity | null = null;
    if (botSettingsId) {
      this.logger.verbose(`getting guild from db, botSettingsId: ${botSettingsId}`);
      result = await this.botSettingsRepo.findOne({
        where: {
          id: botSettingsId,
        }
      });
    } else if (guildSId) {
      this.logger.verbose(`getting guild from db, guildId: ${guildSId}`);
      result = await this.botSettingsRepo.findOne({
        where: {
          guildSId,
        }
      });
    }

    if (!result) {
      throw new NotFoundException('Guild not found');
    }
    
    this.logger.log(`found bot settings from db, guildSId: ${guildSId}, botSettingsId: ${botSettingsId}`);

    return {
      id: result.id.toString(),
      guildSId: result.guildSId,
      guildName: result.name,
      poapManagerRoleId: result.poapManagerRoleSId,
      privateChannelId: result.privateChannelSId,
      newsChannelId: result.newsChannelSId,
    };
  }

  /**
   * Setup the discord bot in a guild
   * 
   * @param guildSId guild snowflake ID
   * @param poapManagerRoleSId poap manager role snowflake ID
   * @param privateChannelSId private channel snowflake ID
   * @param newsChannelSId news channel snowflake ID
   * 
   * @returns Promise<DiscordBotPostResponseDto>
   */
  async addBotToGuild(
    {guildSId}: DiscordBotPostRequestDto
  ): Promise<DiscordBotPostResponseDto> {
    this.logger.log('starting discord bot setup process');

    const botSettings = await this.botSettingsRepo.findOne({
      where: {
        guildSId: guildSId,
      }
    });

    if (botSettings) {
      this.logger.warn(`discord bot already exists in guild: ${guildSId}`);
      throw new ConflictException('Discord bot already exists');
    }

    const guild = await this.discordClient.guilds.fetch(guildSId);
    
    const poapManagerRole: Role = await this.createPoapManagerRole(guild);

    await this.assignRoleToBot(guild, poapManagerRole);

    const privateChannel: TextChannel = await this.createPrivateChannel(guild);
    let newsChannel;

    if (guild.features.includes('COMMUNITY')) {
      newsChannel = await this.createAnnouncementChannel(guild, poapManagerRole);
      this.sendNewsToChannel(newsChannel).catch((err) => {
        this.logger.error(`failed to send news to channel, guildId: ${guild.id}, guildName: ${guild.name}`, err);
      });
    }
    
    this.sendIntroductionToChannel(privateChannel, poapManagerRole).catch((err) => {
      this.logger.error(`failed to send introduction to private channel, guildId: ${guild.id}, guildName: ${guild.name}`, err);
    });

    this.logger.verbose(`settings up bot in db: ${guildSId}`);

    const discordGuild = await this.discordClient.guilds.fetch(guildSId);

    if (!discordGuild) {
      throw new UnprocessableEntityException('Invalid guildId');
    }

    const newBotSettings: DiscordBotSettingsEntity = {
      guildSId,
      name: discordGuild.name,
      ownerSid: discordGuild.ownerId,
      description: discordGuild.description ?? undefined,
      poapManagerRoleSId: poapManagerRole.id,
      privateChannelSId: privateChannel.id,
      newsChannelSId: newsChannel?.id ?? undefined,
    } as DiscordBotSettingsEntity;

    let result;
    try {
      result = await this.botSettingsRepo.save(newBotSettings);
    } catch(err) {
      this.logger.error('failed to insert discord bot settings', err);
      throw new UnprocessableEntityException('Invalid guildId');
    }

    this.logger.log(`bot added to guild: ${guildSId}`);
    return {
      discordBotSettingsId: result.id,
    };
  }

  async updateBotPermissions() {
    throw new InternalServerErrorException('Method not implemented.');
  }

  /**
   * Remove guild data from cache and database for discord bot
   * @param guildSId guild snowflake ID
   * @param botSettingsId discord bot settings ID
   * @returns Promise<void>
   */
  async removeBotFromGuild({guildSId, botSettingsId}: DiscordBotDeleteRequestDto) {
    this.logger.log(`removing discord bot from guild: ${guildSId}`);

    if (botSettingsId) {
      this.logger.verbose(`removing bot settings: ${botSettingsId}`)
      const result = await this.botSettingsRepo.delete({
        id: botSettingsId,
      });
      if (result.affected === 0) {
        throw new NotFoundException('Bot settings not found');
      }
      this.logger.log(`removed bot settings: ${botSettingsId}`)
      await this.cacheManager.del(DISCORD_BOT_SETTINGS(botSettingsId));
      return;
    }

    const result = await this.botSettingsRepo.delete({
      guildSId: guildSId,
    })

    if (result.affected === 0) {
      throw new NotFoundException('Bot settings not found');
    }

    this.logger.verbose(`removing guild from cache: ${guildSId}`);
    await this.cacheManager.del(DISCORD_BOT_SETTINGS_GUILDSID(guildSId));
    this.logger.verbose(`removed guild from cache: ${guildSId}`);
    
    this.logger.log(`removed bot settings: ${guildSId}`)
  }

  /**
   * Helper functions
   */

  private async createPoapManagerRole(guild: Guild): Promise<Role> {
    this.logger.verbose('attempting to create poap manager role in guild');
    try {
      const role: Role = await guild.roles.create({
        name: 'POAP Managers',
        color: Colors.DarkGreen,
        permissions: this.allowedPermissions,
        hoist: true,
      });
      this.logger.verbose(
        `poap manager role created, roleId: ${role.id}, name: ${role.name}`,
      );
      return role;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        `failed to create poap manager role, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
    }
  }

  private async assignRoleToBot(guild: Guild, role: Role) {
    this.logger.verbose('attempting to assign role to bot');

    try {
      const botMember = await guild.members.fetch(
        this.configService.get('DISCORD_BOT_APPLICATION_ID') as string,
      );
      await botMember.roles.add(role);
      this.logger.verbose('role assigned to bot');
      return botMember;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        `failed to assign role to bot, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
    }
  }

  private async createPrivateChannel(guild: Guild): Promise<TextChannel> {
    this.logger.verbose(
      `attempting to create private channel for guild: ${guild.id}`,
    )
    try {
      const channel: TextChannel = await guild.channels
        .create({
          name: 'poap-commands',
          reason: 'channel registration',
          type: ChannelType.GuildText,
          position: 1,
        });
    this.logger.verbose(`private channel created, channelId: ${channel.id}`);
    return channel;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        `failed to create private channel, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
    }
  }

  private async createAnnouncementChannel(guild: Guild, role: Role) {
    this.logger.verbose(
      `attempting to create news channel, for guild: ${guild.id}`,
    );

    try {
      const newsChannel: NewsChannel = await guild.channels
        .create({
          name: 'poap-news',
          reason: 'guild announcement channel registration',
          type: ChannelType.GuildAnnouncement,
          position: 0,
          permissionOverwrites: [
            {
              id: role.id,
              allow: this.allowedPermissions,
            },
            {
              id: this.configService.get('DISCORD_BOT_APPLICATION_ID') as string,
              allow: this.allowedPermissions,
            },
            {
              id: guild.roles.everyone.id,
              deny: [
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.SendMessagesInThreads,
                PermissionsBitField.Flags.CreatePublicThreads,
              ],
            },
            {
              id: guild.roles.everyone.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AddReactions,
              ],
            },
          ],
        });
      this.logger.verbose(`news channel created, channelId: ${newsChannel.id}`);
      return newsChannel;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        `failed to create news channel, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
    }
  
  }

  private async sendNewsToChannel(announcementsChannel: NewsChannel) {
    this.logger.verbose(
      `attempting to send news to channel, ${announcementsChannel.id}`,
    );
    return announcementsChannel
      .send({
        embeds: [
          {
            title: 'POAP Announcements Channel',
            color: Colors.Green,
            description:
              'This channel is for POAP announcements. Here the community can see when POAP events begin, end, and are ready to be claimed.',
          },
        ],
      });
  }

  private async sendIntroductionToChannel(channel: TextChannel, role: Role) {
    this.logger.verbose(
      `attempting to send introduction to private channel, channel: ${channel.id}, role: ${role.id}`,
    );
    const HOW_TO_ARRANGE_ROLE_URL =
      'https://degen-public.s3.amazonaws.com/public/assets/how_to_arrange_authorized_degens_role.gif';
    const HOW_TO_ADD_ROLE_URL =
      'https://degen-public.s3.amazonaws.com/public/assets/how_to_add_degen_role.gif';
    return channel
      .send({
        embeds: [
          {
            title: 'POAP Management Channel',
            color: Colors.Green,
            description:
              'This channel is for managing community POAPs. You can begin, end, distribute, and mint POAPs from this channel. ',
          },
          {
            title: 'Permissions',
            color: Colors.Green,
            description:
              `Only users with the \`${role.name}\` role can start, end, and distribute POAPs. ` +
              `Please move the \`@${role.name}\` to the highest role position you feel most comfortable. ` +
              'This will ensure that the bot has the correct permissions to manage POAPs.',
            fields: [
              {
                name: 'How To Arrange Role',
                value: HOW_TO_ARRANGE_ROLE_URL,
              },
            ],
          },
          {
            title: 'Usage',
            color: Colors.Green,
            description:
              'To create begin POAP tracking, type `/start` followed by the POAP name and voice channel. ' +
              'For example: `/start name: Community Call channel: voice-channel`. For additional help, type `/help`.',
            fields: [
              {
                name: 'How to Add Role',
                value: HOW_TO_ADD_ROLE_URL,
              },
            ],
          },
        ],
      });
  }
}