import { ConflictException, Injectable, Logger } from '@nestjs/common';
import PostEventRequestDto from './dto/post/event.request.dto';
import { PoapEvent } from './schemas/poap-events.schema';
import { Model } from 'mongoose';
import { EventType } from './enums/event-type.enum';
import PostEventResponseDto from './dto/post/event.response.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class EventsService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(PoapEvent.name) private poapEventModel: Model<PoapEvent>,
  ) {}
  async create(request: PostEventRequestDto): Promise<PostEventResponseDto> {
    this.logger.log(
      `Creating poap event for guild: ${request.guildId}, channel: ${request.channelId}, organizer: ${request.organizerId}`,
    );

    const existingEvent = await this.poapEventModel.exists({
      guildId: request.guildId,
      isActive: true,
      channelId: request.channelId,
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
    poapEvent.channelId = request.channelId;
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
    this.logger.log(`Store poap event in db _id: ${result._id}`);

    return new PostEventResponseDto();
  }
}
