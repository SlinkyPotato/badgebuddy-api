import { Injectable, Logger } from '@nestjs/common';
import { CommunityEventDiscordEntity, DiscordActiveCommunityEventsGetResponseDto, DiscordActiveCommunityEventDto } from '@badgebuddy/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DiscordCommunityEventsActiveByIdGetRequestDto,
  DiscordCommunityEventsActiveByGuildGetRequestDto,
  DiscordCommunityEventsActiveByOrganizerGetRequestDto,
  DiscordCommunityEventsActiveByVoiceChannelGetRequestDto,
  DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto
} from '@badgebuddy/common';

@Injectable()
export class DiscordCommunityEventsActiveService {

  constructor(
    @InjectRepository(CommunityEventDiscordEntity) private communityEventRepo: Repository<CommunityEventDiscordEntity>,
    private readonly logger: Logger,
  ) {}
  
  async getActiveEvents() {
    this.logger.log('Getting all active events');
    let activeEvents: CommunityEventDiscordEntity[] = [];
    try {
      const currentDate = new Date();
      activeEvents = await this.communityEventRepo.find({
        relations: {
          communityEvent: true,
          botSettings: true,
          organizer: true,
        },
        where: {
          communityEvent: {
            endDate: MoreThan(currentDate),
          }
        }
      });
    } catch (e) {
      this.logger.error('Error getting all active events');
      throw e;
    }
    return this.mapEventToResponse(activeEvents);
  }
  
  async getActiveEventsById(
    {communityEventId}: DiscordCommunityEventsActiveByIdGetRequestDto
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    this.logger.log(`Getting active event for eventId: ${communityEventId}`);
    let activeEvents: CommunityEventDiscordEntity[] = [];
    try {
      const currentDate = new Date();
      activeEvents = await this.communityEventRepo.find({
        relations: {
          communityEvent: true,
          botSettings: true,
          organizer: true,
        },
        where: {
          communityEventId,
          communityEvent: {
            endDate: MoreThan(currentDate),
          }
        }
      });
    } catch (e) {
      this.logger.log(`Error getting active event for eventId: ${communityEventId}`);
      throw e;
    }
    return this.mapEventToResponse(activeEvents);
  }
  
  async getActiveEventsByGuildId(
    { guildSId }: DiscordCommunityEventsActiveByGuildGetRequestDto
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    console.log(guildSId);
    this.logger.log(`Getting active event for guildSId: ${guildSId}`);
    let activeEvents: CommunityEventDiscordEntity[] = [];
    try {
      const currentDate = new Date();
      activeEvents = await this.communityEventRepo.find({
        relations: {
          communityEvent: true,
          botSettings: true,
          organizer: true,
        },
        where: {
          botSettings: {
            guildSId: guildSId,
          },
          communityEvent: {
            endDate: MoreThan(currentDate),
          }
        }
      });
    } catch (e) {
      this.logger.log(`Error getting active event for guildSId: ${guildSId}`);
      throw e;
    }
    return this.mapEventToResponse(activeEvents);
  }
  
  async getActiveEventsByOrganizerId(
    {organizerSId}: DiscordCommunityEventsActiveByOrganizerGetRequestDto
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    this.logger.log(`Getting active event for organizerSId: ${organizerSId}`);
    let activeEvents: CommunityEventDiscordEntity[] = [];
    try {
      const currentDate = new Date();
      activeEvents = await this.communityEventRepo.find({
        relations: {
          communityEvent: true,
          botSettings: true,
          organizer: true,
        },
        where: {
          organizer: {
            userSId: organizerSId,
          },
          communityEvent: {
            endDate: MoreThan(currentDate),
          }
        }
      });
    } catch (e) {
      this.logger.log(`Error getting active event for organizerSId: ${organizerSId}`);
      throw e;
    }
    return this.mapEventToResponse(activeEvents);
  }
  
  async getActiveEventsByVoiceChannelId(
    {voiceChannelSId}: DiscordCommunityEventsActiveByVoiceChannelGetRequestDto
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    this.logger.log(`Getting active event for voiceChannelSId: ${voiceChannelSId}`);
    let activeEvents: CommunityEventDiscordEntity[] = [];
    try {
      const currentDate = new Date();
      activeEvents = await this.communityEventRepo.find({
        relations: {
          communityEvent: true,
          botSettings: true,
          organizer: true,
        },
        where: {
          voiceChannelSId: voiceChannelSId,
          communityEvent: {
            endDate: MoreThan(currentDate),
          }
        }
      });
    } catch (e) {
      this.logger.log(`Error getting active event for voiceChannelSId: ${voiceChannelSId}`);
      throw e;
    }
    return this.mapEventToResponse(activeEvents);
  }
  
  async getActiveEventsByGuildIdAndOrganizerId(
    { guildSId, organizerSId }: DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    this.logger.log(`Getting active event for guildSId: ${guildSId}, organizerSId: ${organizerSId}`);
    let activeEvents: CommunityEventDiscordEntity[] = [];
    try {
      const currentDate = new Date();
      activeEvents = await this.communityEventRepo.find({
        relations: {
          communityEvent: true,
          botSettings: true,
          organizer: true,
        },
        where: {
          botSettings: {
            guildSId: guildSId,
          },
          organizer: {
            userSId: organizerSId,
          },
          communityEvent: {
            endDate: MoreThan(currentDate),
          }
        }
      });
    } catch (e) {
      this.logger.log(`Error getting active event for guildSId: ${guildSId}, organizerSId: ${organizerSId}`);
      throw e;
    }
    return this.mapEventToResponse(activeEvents);
  }

  private mapEventToResponse(activeEvents: CommunityEventDiscordEntity[]): DiscordActiveCommunityEventsGetResponseDto {
    const events = activeEvents.map<DiscordActiveCommunityEventDto>((event) => {
      return {
        communityEventId: event.communityEventId,
        title: event.communityEvent.title,
        description: event.communityEvent.description ?? undefined,
        guildSId: event.botSettings!.guildSId,
        voiceChannelSId: event.voiceChannelSId,
        organizerSId: event.organizer!.userSId,
        startDate: event.communityEvent.startDate,
        endDate: event.communityEvent.endDate,
      } as DiscordActiveCommunityEventDto;
    });
    this.logger.log(`Found ${events.length} active events`);
    return {
      events: events,
    }
  }
}
