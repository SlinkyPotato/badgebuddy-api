import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PoapEvent } from './schemas/poap-events.schema';
import { Model } from 'mongoose';
import { EventType } from './enums/event-type.enum';
import { InjectModel } from '@nestjs/mongoose';
import PostEventResponseDto from './dto/post/post-event.response.dto';
import PostEventRequestDto from './dto/post/post-event.request.dto';
import PutEventRequestDto from './dto/put/put-event.request.dto';
import PutEventResponseDto from './dto/put/put-event.response.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(PoapEvent.name) private poapEventModel: Model<PoapEvent>,
  ) {}

  async start(request: PostEventRequestDto): Promise<PostEventResponseDto> {
    this.logger.log(
      `Creating poap event for guild: ${request.guildId}, channel: ${request.voiceChannelId}, organizer: ${request.organizerId}`,
    );

    const existingEvent = await this.poapEventModel.exists({
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

    const poapEvent: PoapEvent = new PoapEvent();
    poapEvent.guildId = request.guildId;
    poapEvent.voiceChannelId = request.voiceChannelId;
    poapEvent.organizerId = request.organizerId;
    poapEvent.eventName = request.eventName;
    poapEvent.startDate = currentDate;
    poapEvent.endDate = endDate;
    poapEvent.eventType = EventType.BY_ATTENDANCE;
    poapEvent.isActive = true;
    poapEvent.participants = [];

    const result = await this.poapEventModel.create(poapEvent);
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
    this.logger.log('Stopping event');
    return new PutEventResponseDto();
  }
}
