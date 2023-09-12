import { Injectable, Logger } from '@nestjs/common';
import {
  ChannelType,
  Colors,
  Guild,
  NewsChannel,
  PermissionsBitField,
  Role,
  TextChannel,
} from 'discord.js';
import { GuildsService } from '../../api/guilds/guilds.service';
import { ConfigService } from '@nestjs/config';
import PostGuildRequestDto from '../../api/guilds/dto/post/guild.request.dto';

@Injectable()
export class GuildCreateService {
  constructor(
    private readonly logger: Logger,
    private guildsApiService: GuildsService,
    private configService: ConfigService,
  ) {}

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

  async setupGuild(guild: Guild) {
    this.logger.log('attempting to setup guild');
    const poapManagerRole: Role = await this.createPoapManagerRole(guild);

    await this.assignRoleToBot(guild, poapManagerRole);

    const privateChannel: TextChannel = await this.createPrivateChannel(guild);
    let newsChannel;

    if (guild.features.includes('COMMUNITY')) {
      newsChannel = await this.createNewsChannel(guild, poapManagerRole);
      const msg = this.announcePOAPChannel(newsChannel);
      if (!msg) {
        this.logger.error(
          `failed to announce news channel, guildId: ${guild.id}, guildName: ${guild.name}`,
        );
      }
    }
    const msg = this.announceInstructions(privateChannel, poapManagerRole);
    if (!msg) {
      this.logger.error(
        `failed to announce instructions, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
    }

    const request: PostGuildRequestDto = {
      guildName: guild.name,
      poapManagerRoleId: poapManagerRole.id,
      privateChannelId: privateChannel.id,
      newsChannelId: newsChannel?.id,
    };
    const response = this.guildsApiService.create(guild.id, request);
    this.logger.log('guild setup complete');
    return response;
  }

  private async createPoapManagerRole(guild: Guild): Promise<Role> {
    this.logger.verbose('attempting to create poap manager role in guild');
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
  }

  private async assignRoleToBot(guild: Guild, role: Role) {
    this.logger.verbose('attempting to assign role to bot');
    const botMember = await guild.members.fetch(
      this.configService.get('DISCORD_BOT_APPLICATION_ID') as string,
    );
    await botMember.roles.add(role).catch((err) => {
      this.logger.error(err);
      throw new Error(
        `failed to assign role to bot, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
    });
    this.logger.verbose('role assigned to bot');
  }

  private async createPrivateChannel(guild: Guild): Promise<TextChannel> {
    this.logger.verbose('attempting to create POAP channel');

    if (!guild.available) {
      this.logger.warn(
        `guild outage for, guildId: ${guild.id}, guildName: ${guild.name}`,
      );
      throw new Error('failed to setup on downed discord server');
    }
    this.logger.verbose('guild is available');

    const channel: TextChannel = await guild.channels.create({
      name: 'poap-commands',
      reason: 'channel registration',
      type: ChannelType.GuildText,
      position: 1,
    });
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error('failed to setup channel');
    }
    this.logger.verbose(`channel created, channelId: ${channel.id}`);
    return channel;
  }

  private async createNewsChannel(guild: Guild, role: Role) {
    this.logger.verbose('attempting to create announcements channel');

    const newsChannel: NewsChannel = await guild.channels.create({
      name: 'POAP Announcements',
      reason: 'news channel registration',
      type: ChannelType.GuildNews,
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
    if (!newsChannel || newsChannel.type !== ChannelType.GuildNews) {
      throw new Error('failed to setup channel');
    }
    this.logger.verbose(`channel created, channelId: ${newsChannel.id}`);
    return newsChannel;
  }

  private announcePOAPChannel(announcementsChannel: NewsChannel) {
    this.logger.verbose(
      `attempting to announce async news channel, ${announcementsChannel.id}`,
    );
    return announcementsChannel.send({
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

  private announceInstructions(channel: TextChannel, role: Role) {
    this.logger.verbose(
      `attempting to announce async instructions, channel: ${channel.id}, role: ${role.id}`,
    );
    const HOW_TO_ARRANGE_ROLE_URL =
      'https://degen-public.s3.amazonaws.com/public/assets/how_to_arrange_authorized_degens_role.gif';
    const HOW_TO_ADD_ROLE_URL =
      'https://degen-public.s3.amazonaws.com/public/assets/how_to_add_degen_role.gif';
    return channel.send({
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
