import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import PostEventResponseDto from './dto/post/post-event.response.dto';
import PostEventRequestDto from './dto/post/post-event.request.dto';
import PutEventRequestDto from './dto/put/put-event.request.dto';
import PutEventResponseDto from './dto/put/put-event.response.dto';
import GetActiveEventResponseDto, {
  ActiveEventDto,
} from './dto/get/get-active-event-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  CommunityEvent,
  CommunityEventDocument,
} from '@solidchain/badge-buddy-common';

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

    const existingEvent = await this.communityEventModel.exists({
      guildId: request.guildId,
      isActive: true,
      voiceChannelId: request.voiceChannelId,
      organizerId: request.organizerId,
    });

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
    communityEvent.participants = [];

    const result = await this.communityEventModel.create(communityEvent);
    if (!result._id) {
      throw new Error('Failed to create event');
    }
    this.logger.log(`Stored communityEvent in db _id: ${result._id}`);

    this.logger.log('Removing active events from cache');
    await this.cacheManager.del(`/events/active?guildId=${request.guildId}`);
    this.logger.log('Removed active event from cache');

    this.logger.log(`Adding event to start queue, eventId: ${result._id}`);
    await this.eventsQueue.add('start', {
      eventId: result._id.toString(),
    });
    this.logger.log('Added event to queue');

    const response: PostEventResponseDto = new PostEventResponseDto();
    response._id = result._id.toString();
    response.startDate = result.startDate;
    response.endDate = result.endDate;

    this.logger.log(`Returning response: ${JSON.stringify(response)}`);
    return response;
  }

  async stop(request: PutEventRequestDto): Promise<PutEventResponseDto> {
    this.logger.log(
      `Stopping event for guildId: ${request.guildId}, voiceChannelId: ${request.voiceChannelId}, organizerId: ${request.organizerId}`,
    );

    const activeEvent = await this.communityEventModel.findOne({
      guildId: request.guildId,
      isActive: true,
      voiceChannelId: request.voiceChannelId,
      organizerId: request.organizerId,
    });

    if (!activeEvent) {
      this.logger.warn('Active event not found');
      throw new ConflictException('Active event not found');
    }

    activeEvent.isActive = false;

    const result = await activeEvent.save();
    if (!result._id) {
      throw new Error('Failed to update event');
    }

    this.logger.log('Removing active event from cache');
    await this.cacheManager.del(`/events/active?guildId=${request.guildId}`);
    this.logger.log('Removed active event from cache');

    this.logger.log(`Adding event to end queue, eventId: ${result._id}`);
    await this.eventsQueue.add('end', {
      eventId: result._id.toString(),
    });
    this.logger.log('Added event to queue');

    const response = new PutEventResponseDto();
    response._id = result._id.toString();
    response.isActive = result.isActive;

    this.logger.log(`Returning response: ${JSON.stringify(response)}`);
    return response;
  }

  async getActiveEvents(
    guildId?: string,
    organizerId?: string,
  ): Promise<GetActiveEventResponseDto> {
    this.logger.log(`Getting actives events for guildId: ${guildId}`);
    let activeEvents: CommunityEventDocument[] = [];

    if (guildId && organizerId) {
      activeEvents = await this.communityEventModel.find({
        guildId: guildId,
        organizerId: organizerId,
        isActive: true,
      });
    } else if (guildId) {
      activeEvents = await this.communityEventModel.find({
        guildId: guildId,
        isActive: true,
      });
    } else if (organizerId) {
      activeEvents = await this.communityEventModel.find({
        organizerId: organizerId,
        isActive: true,
      });
    }

    const response = new GetActiveEventResponseDto();
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
}
