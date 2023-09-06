import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import PostEventResponseDto from './dto/post/post-event.response.dto';
import PostEventRequestDto from './dto/post/post-event.request.dto';
import PutEventRequestDto from './dto/put/put-event.request.dto';
import PutEventResponseDto from './dto/put/put-event.response.dto';
import GetActiveEventsResponseDto, {
  ActiveEventDto,
} from './dto/get/get-active-events.response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  CommunityEvent,
  CommunityEventDocument,
  CommunityEventDto,
} from '@solidchain/badge-buddy-common';
import GetActiveEventsRequestDto from './dto/get/get-active-events.request.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(CommunityEvent.name)
    private communityEventModel: Model<CommunityEvent>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('events') private eventsQueue: Queue,
  ) {}

  async start(request: PostEventRequestDto): Promise<PostEventResponseDto> {
    this.logger.log(
      `Starting community event for guild: ${request.guildId}, channel: ${request.voiceChannelId}, organizer: ${request.organizerId}`,
    );

    const existingEvent = await this.communityEventModel
      .exists({
        guildId: request.guildId,
        isActive: true,
        voiceChannelId: request.voiceChannelId,
        organizerId: request.organizerId,
      })
      .exec();

    if (existingEvent) {
      throw new ConflictException('Event already exists and active');
    }

    const currentDate = new Date();
    const endDate = new Date(
      currentDate.getTime() + request.duration * 60 * 1000,
    );
    this.logger.log(
      `startDate: ${currentDate}, endDate: ${endDate}, guildId: ${request.guildId}`,
    );

    const communityEvent: CommunityEvent = new CommunityEvent();
    communityEvent.guildId = request.guildId;
    communityEvent.voiceChannelId = request.voiceChannelId;
    communityEvent.organizerId = request.organizerId;
    communityEvent.eventName = request.eventName;
    communityEvent.startDate = currentDate;
    communityEvent.endDate = endDate;
    communityEvent.isActive = true;

    const result = await this.communityEventModel.create(communityEvent);
    if (!result._id) {
      throw new Error('Failed to create event');
    }
    this.logger.log(`Stored communityEvent in db _id: ${result._id}`);

    await this.removeEventsFromCacheInterceptor(
      result.guildId,
      result.voiceChannelId,
      result.organizerId,
    );

    this.logger.log(`Adding event to start queue, eventId: ${result._id}`);
    await this.eventsQueue.add('start', {
      eventId: result._id.toString(),
    });
    this.logger.log('Added event to queue');

    const response: PostEventResponseDto = new PostEventResponseDto();
    response._id = result._id.toString();
    response.startDate = result.startDate;
    response.endDate = result.endDate;

    await this.addActiveEventToCache(result);

    this.logger.log(`Returning response: ${JSON.stringify(response)}`);
    return response;
  }

  async stop(request: PutEventRequestDto): Promise<PutEventResponseDto> {
    this.logger.log(
      `Stopping event for guildId: ${request.guildId}, voiceChannelId: ${request.voiceChannelId}, organizerId: ${request.organizerId}`,
    );

    const activeEvent = await this.communityEventModel
      .findOne({
        guildId: request.guildId,
        isActive: true,
        voiceChannelId: request.voiceChannelId,
        organizerId: request.organizerId,
      })
      .exec();

    if (!activeEvent) {
      this.logger.warn('Active event not found');
      throw new ConflictException('Active event not found');
    }

    activeEvent.isActive = false;

    const result = await activeEvent.save();
    if (!result._id) {
      throw new Error('Failed to update event');
    }

    await this.removeEventsFromCacheInterceptor(
      result.guildId,
      result.voiceChannelId,
      result.organizerId,
    );

    this.logger.log(`Adding event to end queue, eventId: ${result._id}`);
    await this.eventsQueue.add('end', {
      eventId: result._id.toString(),
    });
    this.logger.log('Added event to queue');

    const response = new PutEventResponseDto();
    response._id = result._id.toString();
    response.isActive = result.isActive;

    await this.removeActiveEventFromCache(result);

    this.logger.log(`Returning response: ${JSON.stringify(response)}`);
    return response;
  }

  async getActiveEvents(
    query: GetActiveEventsRequestDto,
  ): Promise<GetActiveEventsResponseDto> {
    this.logger.log(`Getting actives events for guildId: ${query.guildId}`);
    let activeEvents: CommunityEventDocument[] = [];

    if (query.eventId) {
      this.logger.log(`Getting active event for eventId: ${query.eventId}`);
      activeEvents = await this.communityEventModel
        .find<CommunityEventDocument>({
          _id: query.eventId,
          isActive: true,
        })
        .exec();
    } else if (query.organizerId) {
      this.logger.log(
        `Getting active event for organizerId: ${query.organizerId}`,
      );
      activeEvents = await this.communityEventModel
        .find<CommunityEventDocument>({
          organizerId: query.organizerId,
          isActive: true,
        })
        .exec();
    } else if (query.organizerId && query.guildId) {
      this.logger.log(
        `Getting active event for organizerId: ${query.organizerId}, guildId: ${query.guildId}`,
      );
      activeEvents = await this.communityEventModel
        .find<CommunityEventDocument>({
          guildId: query.guildId,
          organizerId: query.organizerId,
          isActive: true,
        })
        .exec();
    } else if (query.guildId) {
      this.logger.log(`Getting active event for guildId: ${query.guildId}`);
      activeEvents = await this.communityEventModel
        .find<CommunityEventDocument>({
          guildId: query.guildId,
          isActive: true,
        })
        .exec();
    } else if (query.voiceChannelId) {
      this.logger.log(
        `Getting active event for voiceChannelId: ${query.guildId}`,
      );
      activeEvents = await this.communityEventModel
        .find<CommunityEventDocument>({
          voiceChannelId: query.voiceChannelId,
          isActive: true,
        })
        .exec();
    } else {
      this.logger.log(`Getting all active events`);
      activeEvents = await this.communityEventModel
        .find<CommunityEventDocument>({
          isActive: true,
        })
        .exec();
    }

    const response = new GetActiveEventsResponseDto();
    response.events = [];
    for (const activeEvent of activeEvents) {
      const event = new ActiveEventDto();
      event._id = activeEvent._id.toString();
      event.eventName = activeEvent.eventName;
      event.guildId = activeEvent.guildId;
      event.voiceChannelId = activeEvent.voiceChannelId;
      event.organizerId = activeEvent.organizerId;
      event.startDate = activeEvent.startDate;
      event.endDate = activeEvent.endDate;
      response.events.push(event);
    }

    this.logger.log(`Returning response`);
    return response;
  }

  /**
   * Removes the active events from cache interceptor
   * @param guildId
   * @param voiceChannelId
   * @param organizerId
   * @param eventId
   * @private
   */
  private async removeEventsFromCacheInterceptor(
    guildId?: string,
    voiceChannelId?: string,
    organizerId?: string,
    eventId?: string,
  ) {
    this.logger.log('Removing active events from cache');
    await this.cacheManager.del(`/events/active`);
    await this.cacheManager.del(`/events/active?eventId=${eventId}`);
    await this.cacheManager.del(`/events/active?guildId=${guildId}`);
    await this.cacheManager.del(
      `/events/active?voiceChannelId=${voiceChannelId}`,
    );
    await this.cacheManager.del(`/events/active?organizerId=${organizerId}`);
    await this.cacheManager.del(
      `/events/active?organizerId=${organizerId}&guildId=${guildId}`,
    );
    this.logger.log('Removed active event from cache');
  }

  /**
   * Adds the active event to the cache used in the processor
   * @param event
   * @private
   */
  private async addActiveEventToCache(event: CommunityEventDocument) {
    this.logger.log(
      `Adding active event to cache by voiceChannelId: ${event.voiceChannelId}`,
    );
    const cacheEvent = new CommunityEventDto();
    cacheEvent.eventId = event._id.toString();
    cacheEvent.eventName = event.eventName;
    cacheEvent.guildId = event.guildId;
    cacheEvent.voiceChannelId = event.voiceChannelId;
    cacheEvent.organizerId = event.organizerId;
    cacheEvent.startDate = event.startDate.toISOString();
    cacheEvent.endDate = event.endDate.toISOString();

    await this.cacheManager.set(
      `tracking:events:active:voiceChannelId:${event.voiceChannelId}`,
      cacheEvent,
      0,
    );
    this.logger.log(`Added active event to cache, eventId: ${event._id}`);
  }

  /**
   * Removes the active event from the cache used in the processor
   * @param event
   * @private
   */
  private async removeActiveEventFromCache(event: CommunityEventDocument) {
    this.logger.log(
      `Removing active event from cache by voiceChannelId: ${event.voiceChannelId}`,
    );
    await this.cacheManager.del(
      `tracking:events:active:voiceChannelId:${event.voiceChannelId}`,
    );
    this.logger.log(
      `Removed active event from cache, eventId: ${event._id}, voiceChannelId: ${event.voiceChannelId}`,
    );
  }
}
