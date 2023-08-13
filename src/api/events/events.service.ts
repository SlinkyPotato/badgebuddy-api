import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { EventType } from './enums/event-type.enum';
import { InjectModel } from '@nestjs/mongoose';
import PostEventResponseDto from './dto/post/post-event.response.dto';
import PostEventRequestDto from './dto/post/post-event.request.dto';
import PutEventRequestDto from './dto/put/put-event.request.dto';
import PutEventResponseDto from './dto/put/put-event.response.dto';
import GetActiveEventResponseDto, {
  ActiveEventDto,
} from './dto/get/get-active-event-response.dto';
import {
  CommunityEvent,
  CommunityEventDocument,
} from './schemas/community-event.schema';

@Injectable()
export class EventsService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(CommunityEvent.name)
    private communityEventModel: Model<CommunityEvent>,
  ) {}

  async start(request: PostEventRequestDto): Promise<PostEventResponseDto> {
    this.logger.log(
      `Creating poap event for guild: ${request.guildId}, channel: ${request.voiceChannelId}, organizer: ${request.organizerId}`,
    );
    this.logger.log('test');

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

    const poapEvent: CommunityEvent = new CommunityEvent();
    poapEvent.guildId = request.guildId;
    poapEvent.voiceChannelId = request.voiceChannelId;
    poapEvent.organizerId = request.organizerId;
    poapEvent.eventName = request.eventName;
    poapEvent.startDate = currentDate;
    poapEvent.endDate = endDate;
    poapEvent.eventType = EventType.BY_ATTENDANCE;
    poapEvent.isActive = true;
    poapEvent.participants = [];

    const result = await this.communityEventModel.create(poapEvent);
    if (!result._id) {
      throw new Error('Failed to create event');
    }
    this.logger.log(`Stored poapEvent in db _id: ${result._id}`);

    const response: PostEventResponseDto = new PostEventResponseDto();
    response._id = result._id.toString();
    response.eventType = result.eventType;
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
