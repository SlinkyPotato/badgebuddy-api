import {
  Controller,
  Get,
  HttpStatus,
  Param,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { DiscordCommunityEventsActiveByGuildGetRequestDto } from './dto/discord-community-events-active-by-guild-get-request/discord-community-events-active-by-guild-get-request.dto';
import { DiscordCommunityEventsActiveByIdGetRequestDto } from './dto/discord-community-events-active-by-id-get-request/discord-community-events-active-by-id-get-request.dto';
import { DiscordCommunityEventsActiveByVoiceChannelGetRequestDto } from './dto/discord-community-events-active-by-voice-channel-get-request/discord-community-events-active-by-voice-channel-get-request.dto';
import { DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto } from './dto/discord-community-events-active-by-guild-and-organizer-get-request/discord-community-events-active-by-guild-and-organizer-get-request.dto';
import { DiscordActiveCommunityEventsGetResponseDto } from './dto/active-community-events-get-response.dto';
import { DiscordActiveCommunityEventsService } from './discord-active-community-events.service';
import { DiscordCommunityEventsActiveByOrganizerGetRequestDto } from './dto/discord-community-events-active-by-organizer-get-request/discord-community-events-active-by-organizer-get-request.dto';

@Controller('discord/community-events/active')
@ApiTags('Active Discord Community Events')
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
export class DiscordCommunityEventsActiveController {

  constructor(
    private readonly activeEventsService: DiscordActiveCommunityEventsService,
  ) { }

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

  @Get('id/:id')
  @ApiOperation({ summary: 'Retrieve active events by ID.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: DiscordActiveCommunityEventsGetResponseDto,
  })
  getActiveEventsById(
    @Param() params: DiscordCommunityEventsActiveByIdGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
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
    @Param() params: DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto,
  ): Promise<DiscordActiveCommunityEventsGetResponseDto> {
    return this.activeEventsService.getActiveEventsByGuildIdAndOrganizerId(params);
  }
}
