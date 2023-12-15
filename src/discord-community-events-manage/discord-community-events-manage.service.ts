import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  CommunityEventDiscordEntity,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD_ORGANIZER,
  DISCORD_COMMUNITY_EVENTS_ACTIVE,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_ID,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_ORGANIZER,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_VOICE_CHANNEL,
  TRACKING_EVENTS_ACTIVE,
  DISCORD_COMMUNITY_EVENTS_QUEUE,
  DiscordUserEntity,
  DiscordBotSettingsEntity,
  CommunityEventEntity,
  DiscordActiveCommunityEventDto,
  PoapLinksEntity,
} from '@badgebuddy/common';
import { DataSource, MoreThan, Repository } from 'typeorm';
import {
  DiscordCommunityEventPostRequestDto,
  DiscordCommunityEventPostResponseDto,
  DiscordCommunityEventPatchRequestDto,
  DiscordCommunityEventPatchResponseDto
} from '@badgebuddy/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type PoapLink = {
  qrCode: string | undefined,
  claimUrl: string,
}

@Injectable()
export class DiscordCommunityEventsManageService {

  constructor(
    private readonly logger: Logger,
    @InjectRepository(CommunityEventDiscordEntity) private discordEventRepo: Repository<CommunityEventDiscordEntity>,
    @InjectRepository(DiscordUserEntity) private discordUserRepo: Repository<DiscordUserEntity>,
    @InjectRepository(DiscordBotSettingsEntity) private discordBotSettingsRepo: Repository<DiscordBotSettingsEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(DISCORD_COMMUNITY_EVENTS_QUEUE) private eventsQueue: Queue,
    @InjectDiscordClient() private discordClient: Client,
    private readonly httpService: HttpService,
    private dataSource: DataSource,
  ) { }

  async startEvent(
    {title, voiceChannelSId, endDate, guildSId, description, organizerSId, poapLinksUrl}: DiscordCommunityEventPostRequestDto
  ): Promise<DiscordCommunityEventPostResponseDto> {
    this.logger.log('Attempting to start new event.');

    const endDateObj: Date = new Date(endDate);
    const startDateObj: Date = new Date();
    if (endDateObj < startDateObj) {
      this.logger.warn(`Event end date is in the past, endDate: ${endDate}`);
      throw new UnprocessableEntityException('Event end date is in the past and must be greater than 30 minutes from now');
    }

    this.logger.verbose(`checking if active event exists for guild: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizer: ${organizerSId}`);
    const eventExists = await this.discordEventRepo.exist({
      where: {
        botSettings: {
          guildSId: guildSId,
        },
        voiceChannelSId: voiceChannelSId,
        organizer: {
          userSId: organizerSId,
        },
        communityEvent: {
          endDate: MoreThan(new Date()),
        },
      },
    });

    if (eventExists) {
      throw new ConflictException('Event in this channel is already active');
    }

    this.logger.verbose(
      `Starting community event for guild: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizer: ${organizerSId}`,
    );

    let discordOrganizer: DiscordUserEntity | null = null;
    try {
      this.logger.verbose(`Fetching organizer from db, organizerSId: ${organizerSId}`);
      discordOrganizer = await this.discordUserRepo.findOne({
        where: {
          userSId: organizerSId,
        },
      });
      this.logger.verbose(`Fetched organizer from db, organizerSId: ${organizerSId}`);
    } catch (e) {
      this.logger.error(`Error saving event for guild: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizer: ${organizerSId}`);
      throw new InternalServerErrorException('Failed to create event');
    }

    if (!discordOrganizer) {
      this.logger.verbose(`Organizer not found, fetching from discord, organizerSId: ${organizerSId}`);
      const organizer = await this.discordClient.guilds.cache.get(guildSId)?.members.fetch(organizerSId);
      if (!organizer) {
        throw new NotFoundException('Organizer not found');
      }
      discordOrganizer = await this.discordUserRepo.save({
        userSId: organizerSId,
        username: organizer.user.username,
        discriminator: organizer.user.discriminator,
        avatar: organizer.user.avatar,
      } as DiscordUserEntity);
    }

    this.logger.verbose(`Organizer found, organizerSId: ${organizerSId}`);
    let discordBotSettings: DiscordBotSettingsEntity | null = null;
    try {
      this.logger.verbose(`Fetching bot settings for guild: ${guildSId}`);
      discordBotSettings = await this.discordBotSettingsRepo.findOne({
        where: {
          guildSId: guildSId,
        },
      });
      this.logger.verbose(`Bot settings found, guildSId: ${guildSId}`);
    } catch (e) {
      this.logger.error(`Error fetching bot settings for guild: ${guildSId}`, e);
    }

    if (!discordBotSettings) {
      throw new NotFoundException('Bot settings not found');
    }

    this.logger.verbose(`attempting to store event in db, guildSId: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizerId: ${organizerSId}`);
    const newEvent: CommunityEventDiscordEntity = await this.discordEventRepo.save({
      botSettingsId: discordBotSettings.id,
      voiceChannelSId: voiceChannelSId,
      organizerId: discordOrganizer.id,
      communityEvent: {
        title: title,
        description: description,
        startDate: startDateObj,
        endDate: endDateObj,
      } as CommunityEventEntity,
    } as CommunityEventDiscordEntity);
    this.logger.verbose(`Stored communityEvent in db id: ${newEvent.communityEventId}, startDate: ${newEvent.communityEvent.startDate}, endDate: ${newEvent.communityEvent.endDate}`);

    this.removeEventsFromCacheInterceptor(
      guildSId,
      newEvent.voiceChannelSId,
      organizerSId,
      newEvent.communityEventId,
    ).then(() => {
      this.logger.verbose(`Removed active event from cache, communityEventId: ${newEvent.communityEventId}, voiceChannelSId: ${newEvent.voiceChannelSId}`);
    }).catch((e) => {
      this.logger.error(`Error removing active event from cache, eventId: ${newEvent.communityEventId}, voiceChannelSId: ${newEvent.voiceChannelSId}`, e);
    });

    this.logger.verbose(`Adding event to start cache queue, eventId: ${newEvent.communityEventId}`);
    this.eventsQueue.add('start', {
      eventId: newEvent.communityEventId,
    }).then(() => {
      this.logger.verbose('Added event to queue');
    }).catch((e) => {
      this.logger.error(`Error adding event to start queue, eventId: ${newEvent.communityEventId}`, e);
    });

    this.logger.verbose(`Adding active event to cache by voiceChannelSId: ${voiceChannelSId}`);

    this.addEventToCacheTracking(
      newEvent, voiceChannelSId, organizerSId, guildSId
    ).then(() => {
      this.logger.verbose(`Added active event to cache, eventId: ${newEvent.communityEventId}`);
    }).catch((e) => {
      this.logger.error(`Error adding active event to cache, eventId: ${newEvent.communityEventId}`, e);
    });

    let availablePOAPs = 0;

    try {
      availablePOAPs = await this.savePoapLinks(newEvent, poapLinksUrl);
    } catch (e) {
      this.logger.error(`Error saving poap links for event, eventId: ${newEvent.communityEventId}`, e);
    }

    return {
      communityEventId: newEvent.communityEventId,
      startDate: newEvent.communityEvent.startDate.toISOString(),
      endDate: newEvent.communityEvent.endDate.toISOString(),
      availablePOAPs,
    };
  }

  /**
   * Ends the community event
   * @param guildSId
   * @param organizerSId
   * @param voiceChannelSId
   * @returns
   */
  async endEvent(
    {guildSId, voiceChannelSId, poapLinksUrl}: DiscordCommunityEventPatchRequestDto,
  ): Promise<DiscordCommunityEventPatchResponseDto> {
    this.logger.log(
      `Stopping event for guildSId: ${guildSId}, voiceChannelSId: ${voiceChannelSId}`,
    );
    const endDateObj: Date = new Date();
    let discordEvent = await this.discordEventRepo.findOne({
      relations: {
        botSettings: true,
        communityEvent: true,
      },
      where: {
        botSettings: {
          guildSId: guildSId,
        },
        voiceChannelSId: voiceChannelSId,
        communityEvent: {
          endDate: MoreThan(endDateObj),
        },
      }
    });

    if (!discordEvent) {
      throw new NotFoundException('Active event not found');
    }

    discordEvent.communityEvent.endDate = endDateObj;
    try {
      discordEvent = await this.discordEventRepo.save(discordEvent);
    } catch (error) {
      this.logger.error(`Error saving event for guildSId: ${guildSId}, voiceChannelSId: ${voiceChannelSId}`);
      throw new InternalServerErrorException('Failed to update event');
    }

    this.removeEventsFromCacheInterceptor(
      discordEvent.botSettings.guildSId,
      discordEvent.voiceChannelSId,
      discordEvent.organizer.userSId,
      discordEvent.communityEventId,
    ).then(() => {
      this.logger.log(`Removed active event from cache, communityEventId: ${discordEvent?.communityEventId}, voiceChannelSId: ${discordEvent?.voiceChannelSId}`);
    }).catch((e) => {
      this.logger.error(`Error removing active event from cache`, e);
    });

    this.logger.log(`Adding event to end queue, eventId: ${discordEvent.communityEventId}`);
    this.eventsQueue.add('end', {
      eventId: discordEvent.communityEventId,
    }).then(() => {
      this.logger.log('Added event to queue');
    }).catch((e) => {
      this.logger.error(`Error adding event to end queue`, e);
    });

    this.logger.debug(`Removing active event from processor cache, eventId: ${discordEvent.communityEventId}, voiceChannelSId: ${voiceChannelSId}`)
    this.cacheManager.del(TRACKING_EVENTS_ACTIVE(voiceChannelSId))
    .then(() => {
      this.logger.debug(`Removed active event from processor cache, eventId: ${discordEvent?.communityEventId}, voiceChannelSId: ${voiceChannelSId}`)
    }).catch((e) => {
      this.logger.error(`Error removing active event from processor cache, eventId: ${discordEvent?.communityEventId}, voiceChannelSId: ${voiceChannelSId}`, e)
    });

    let availablePOAPs = 0;
    try {
      availablePOAPs = await this.savePoapLinks(discordEvent, poapLinksUrl);
    } catch (e) {
      this.logger.error(`Error saving poap links for event, eventId: ${discordEvent.communityEventId}`, e);
    }

    return {
      communityEventId: discordEvent.communityEventId,
      title: discordEvent.communityEvent.title,
      description: discordEvent.communityEvent.description,
      endDate: discordEvent.communityEvent.endDate.toISOString(),
      organizerUsername: discordEvent.organizer.username,
      startDate: discordEvent.communityEvent.startDate.toISOString(),
      availablePOAPs,
    };
  }

  /**
   * Helper Functions
   */

  /**
   * Removes the active events from cache interceptor
   * @param guildSId
   * @param voiceChannelSId
   * @param organizerSId
   * @param communnityEventId
   * @private
   */
  private async removeEventsFromCacheInterceptor(
    guildSId: string,
    voiceChannelSId: string,
    organizerSId: string,
    communnityEventId: string,
  ) {
    this.logger.log('Removing active events from cache');
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE);
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_ID(communnityEventId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD(guildSId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_VOICE_CHANNEL(voiceChannelSId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_ORGANIZER(organizerSId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD_ORGANIZER({ organizerSId, guildSId }));
    this.logger.log('Removed active event from cache');
  }

  private async addEventToCacheTracking(
    newEvent: CommunityEventDiscordEntity, voiceChannelSId: string, organizerSId: string, guildSId: string
  ): Promise<void> {
    return this.cacheManager.set(TRACKING_EVENTS_ACTIVE(voiceChannelSId),
      {
        communityEventId: newEvent.communityEventId,
        title: newEvent.communityEvent.title,
        description: newEvent.communityEvent.description,
        voiceChannelSId,
        organizerSId,
        guildSId,
        startDate: newEvent.communityEvent.startDate,
        endDate: newEvent.communityEvent.endDate,
      } as DiscordActiveCommunityEventDto,
      0
    );
  }

  public async parsePoapLinksUrl(poapLinksUrl: string): Promise<PoapLink[]> {
    const POAP_LINK_REGEX = /^http[s]?:\/\/poap\.xyz\/.*$/i;
    const QR_CLAIM_REGEX = /^http[s]?:\/\/poap\.xyz\/claim\//i;

    this.logger.verbose(`Fetching poap links from url: ${poapLinksUrl}`);
    const contents = await firstValueFrom(this.httpService.get(poapLinksUrl));
    
    this.logger.verbose(`Fetched poap links from url: ${poapLinksUrl}`);
    const lines: string[] = contents.data.split('\n');
    const poapLinks: PoapLink[] = [];
    
    this.logger.verbose(`Parsing poap links from url: ${poapLinksUrl}`);
    
    for (const line of lines) {
      if (!line.match(POAP_LINK_REGEX)) {
        this.logger.verbose(`Skipping line, does not contain poap link: ${line}`)
        continue;
      }
      let qrCode: string | undefined;
      try {
        qrCode = line.split(QR_CLAIM_REGEX)[1];
      } catch (e) {
        this.logger.error(`Error parsing poap link: ${line}`, e);
      }
      poapLinks.push({
        qrCode,
        claimUrl: line,
      });
    }
    this.logger.verbose(`Finished parsing poap links from url: ${poapLinksUrl}, found ${poapLinks.length} links`);
    return poapLinks;
  }

  private async savePoapLinks(newEvent: CommunityEventDiscordEntity, poapLinksUrl?: string): Promise<number> {
    let savedPOAPs = 0;
    if (poapLinksUrl) {
      this.logger.verbose('found poap links url');
      const poapLinks = await this.parsePoapLinksUrl(poapLinksUrl);
      if (poapLinks.length <= 0) {
        this.logger.warn('No poap links found');
      }

      this.logger.verbose(`Saving poap links for event, eventId: ${newEvent.communityEventId}`);
      const result = await this.dataSource.createQueryBuilder()
        .insert()
        .into(PoapLinksEntity)
        .values(poapLinks.map((poapLink) => ({
          communityEventId: newEvent.communityEventId,
          qrCode: poapLink.qrCode,
          claimUrl: poapLink.claimUrl,
        })))
        .execute();
      savedPOAPs = result.identifiers.length;
      this.logger.verbose(`Saved poap links for event, eventId: ${newEvent.communityEventId}`);
    }
    return savedPOAPs;
  }
}
