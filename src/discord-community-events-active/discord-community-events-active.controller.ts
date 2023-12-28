import {
  Controller,
  Get,
  HttpStatus,
  Param,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { DiscordCommunityEventsActiveService } from './discord-community-events-active.service';
import { DiscordActiveCommunityEventsGetResponseDto } from '@badgebuddy/common';
import {
  DiscordCommunityEventsActiveByIdGetRequestDto,
  DiscordCommunityEventsActiveByGuildGetRequestDto,
  DiscordCommunityEventsActiveByOrganizerGetRequestDto,
  DiscordCommunityEventsActiveByVoiceChannelGetRequestDto,
  DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto,
} from '@badgebuddy/common';
import { UserTokenGuard } from '@/auth/guards/user-token/user-token.guard';

@Controller('discord/community-events/active')
@ApiTags('Active Discord Community Events')
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
@UseGuards(UserTokenGuard)
export class DiscordCommunityEventsActiveController {
  constructor(
    private readonly activeEventsService: DiscordCommunityEventsActiveService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve active events.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEvents(): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    return this.activeEventsService.getActiveEvents();
  }

  @Get('id/:communityEventId')
  @ApiOperation({ summary: 'Retrieve active events by ID.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEventsById(
    @Param() params: DiscordCommunityEventsActiveByIdGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    console.log('called');
    return this.activeEventsService.getActiveEventsById(params);
  }

  @Get('guild/:guildSId')
  @ApiOperation({ summary: 'Retrieve active events by guild.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEventsByGuildId(
    @Param() params: DiscordCommunityEventsActiveByGuildGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    return this.activeEventsService.getActiveEventsByGuildId(params);
  }

  @Get('organizer/:organizerSId')
  @ApiOperation({ summary: 'Retrieve active events by organizer.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEventsByOrganizerId(
    @Param() params: DiscordCommunityEventsActiveByOrganizerGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    return this.activeEventsService.getActiveEventsByOrganizerId(params);
  }

  @Get('voice-channel/:voiceChannelSId')
  @ApiOperation({ summary: 'Retrieve active events by voice channel.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEventsByVoiceChannelId(
    @Param() params: DiscordCommunityEventsActiveByVoiceChannelGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    return this.activeEventsService.getActiveEventsByVoiceChannelId(params);
  }

  @Get('guild/:guildSId/organizer/:organizerSId')
  @ApiOperation({ summary: 'Retrieve active events by guild and organizer.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEventsByGuildIdAndOrganizerId(
    @Param()
    params: DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    return this.activeEventsService.getActiveEventsByGuildIdAndOrganizerId(
      params,
    );
  }
}
