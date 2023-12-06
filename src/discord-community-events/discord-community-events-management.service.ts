import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  CommunityEventDiscordEntity,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD_ORGANIZER,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_ID,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_ORGANIZER,
  DISCORD_COMMUNITY_EVENTS_ACTIVE_VOICE_CHANNEL,
  TRACKING_EVENTS_ACTIVE_VOICE_CHANNEL,
  DISCORD_COMMUNITY_EVENTS_QUEUE,
} from '@badgebuddy/common';
import { LessThan, Repository } from 'typeorm';
import { DiscordCommunityEventPostRequestDto } from './dto/discord-community-event-post-request/discord-community-event-post-request.dto';
import { DiscordCommunityEventPostResponseDto } from './dto/discord-community-event-post-response/discord-community-event-post-response.dto';
import { DiscordCommunityEventPatchRequestDto } from './dto/discord-community-event-patch-request/discord-community-event-patch-request.dto';
import { DiscordCommunityEventPatchResponseDto } from './dto/discord-community-event-patch-response/discord-community-event-patch-response.dto';
import { DiscordActiveCommunityEventDto } from './dto/active-community-events-get-response.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DiscordCommunityEventsManagementService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(CommunityEventDiscordEntity) private discordEventRepo: Repository<CommunityEventDiscordEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(DISCORD_COMMUNITY_EVENTS_QUEUE) private eventsQueue: Queue,
  ) { }

  async startEvent(
    {title, voiceChannelSId, endDate, guildSId, description, organizerSId}: DiscordCommunityEventPostRequestDto
  ): Promise<DiscordCommunityEventPostResponseDto> {
    this.logger.log(
      `Starting community event for guild: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizer: ${organizerSId}`,
    );

    const existingEvent = await this.discordEventRepo.findOne({
      relations: {
        botSettings: true,
        organizer: true,
        communityEvent: true,
      },
      where: {
        botSettings: {
          guildSId: guildSId,
        },
        voiceChannelSId: voiceChannelSId,
        organizer: {
          userSId: organizerSId,
        },
        communityEvent: {
          endDate: LessThan(new Date()),
        },
      },
    });

    if (existingEvent) {
      throw new ConflictException('Event in this channel is already active');
    }

    const currentDate = new Date();
    this.logger.log(`startDate: ${currentDate}, endDate: ${endDate}, guildSId: ${guildSId}`,);

    let newEvent: CommunityEventDiscordEntity;
    try {
      newEvent = await this.discordEventRepo.save({
        guild: {
          guildSId: guildSId,
        },
        voiceChannelSId: voiceChannelSId,
        organizer: {
          userSId: organizerSId,
        },
        communityEvent: {
          eventName: title,
          description: description,
          startDate: currentDate,
          endDate: endDate,
        },
      });
    } catch (e) {
      this.logger.log(`Error saving event for guild: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizer: ${organizerSId}`);
      throw new InternalServerErrorException('Failed to create event');
    }

    this.logger.log(`Stored communityEvent in db id: ${newEvent.communityEventId}`);

    this.removeEventsFromCacheInterceptor(
      newEvent.botSettings.guildSId,
      newEvent.voiceChannelSId,
      newEvent.organizer.userSId,
      newEvent.communityEventId,
    ).then(() => {
      this.logger.log(`Removed active event from cache, communityEventId: ${newEvent.communityEventId}, voiceChannelSId: ${newEvent.voiceChannelSId}`);
    }).catch((e) => {
      this.logger.error(`Error removing active event from cache, eventId: ${newEvent.communityEventId}, voiceChannelSId: ${newEvent.voiceChannelSId}`, e);
    });

    this.logger.log(`Adding event to start cache queue, eventId: ${newEvent.communityEventId}`);
    this.eventsQueue.add('start', {
      eventId: newEvent.communityEventId,
    }).then(() => {
      this.logger.log('Added event to queue');
    }).catch((e) => {
      this.logger.error(`Error adding event to start queue, eventId: ${newEvent.communityEventId}`, e);
    });

    this.logger.log(`Adding active event to cache by voiceChannelSId: ${voiceChannelSId}`);
    this.cacheManager.set(TRACKING_EVENTS_ACTIVE_VOICE_CHANNEL(voiceChannelSId),
      {
        id: newEvent.communityEventId,
        title: newEvent.communityEvent.title,
        description: newEvent.communityEvent.description,
        voiceChannelSId,
        organizerSId,
        guildSId,
        startDate: newEvent.communityEvent.startDate,
        endDate: newEvent.communityEvent.endDate,
      } as DiscordActiveCommunityEventDto,
      0,
    ).then(() => {
      this.logger.log(`Added active event to cache, eventId: ${newEvent.communityEventId}`);
    }).catch((e) => {
      this.logger.error(`Error adding active event to cache, eventId: ${newEvent.communityEventId}`, e);
    });
    return {
      communityEventId: newEvent.communityEventId,
      startDate: newEvent.communityEvent.startDate,
      endDate: newEvent.communityEvent.endDate,
    };
  }

  async stopEvent(
    {guildSId, organizerSId, voiceChannelSId}: DiscordCommunityEventPatchRequestDto,
  ): Promise<DiscordCommunityEventPatchResponseDto> {
    this.logger.log(
      `Stopping event for guildSId: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizerSId: ${organizerSId}`,
    );

    let discordEvent = await this.discordEventRepo.findOne({
      relations: {
        botSettings: true,
        organizer: true,
      },
      where: {
        botSettings: {
          guildSId: guildSId,
        },
        voiceChannelSId: voiceChannelSId,
        organizer: {
          userSId: organizerSId,
        },
      }
    });

    if (!discordEvent) {
      throw new ConflictException('Active event not found');
    }

    discordEvent.communityEvent.endDate = new Date();
    try {
      discordEvent = await this.discordEventRepo.save(discordEvent);
    } catch (error) {
      this.logger.error(`Error saving event for guildSId: ${guildSId}, voiceChannelSId: ${voiceChannelSId}, organizerId: ${organizerSId}`);
      throw new InternalServerErrorException('Failed to update event');
    }

    this.removeEventsFromCacheInterceptor(
      discordEvent.botSettings.guildSId,
      discordEvent.voiceChannelSId,
      discordEvent.organizer.userSId,
      discordEvent.communityEventId,
    ).catch((e) => {
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
    await this.cacheManager.del(TRACKING_EVENTS_ACTIVE_VOICE_CHANNEL(voiceChannelSId));
    return {
      id: discordEvent.communityEventId,
      endDate: discordEvent.communityEvent.endDate,
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
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_ID(communnityEventId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD(guildSId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_VOICE_CHANNEL(voiceChannelSId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_ORGANIZER(organizerSId));
    await this.cacheManager.del(DISCORD_COMMUNITY_EVENTS_ACTIVE_GUILD_ORGANIZER({ organizerSId, guildSId }));
    this.logger.log('Removed active event from cache');
  }
}
