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
import { CommunityEventsActiveDiscordService } from './community-events-active-discord.service';
import {
  CommunityEventsActiveDiscordByGuildAndOrganizerGetRequestDto,
  CommunityEventsActiveDiscordByGuildGetRequestDto,
  CommunityEventsActiveDiscordByIdGetRequestDto,
  CommunityEventsActiveDiscordByOrganizerGetRequestDto,
  CommunityEventsActiveDiscordByVoiceChannelGetRequestDto,
  CommunityEventsActiveDiscordGetResponseDto,
} from '@badgebuddy/common';
import { UserTokenGuard } from '@/auth/guards/user-token/user-token.guard';

@Controller('community-events/active/discord')
@ApiTags('Community Events Active For Discord')
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
@UseGuards(UserTokenGuard)
export class CommunityEventsActiveDiscordController {
  constructor(
    private readonly activeEventsService: CommunityEventsActiveDiscordService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve active events.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: CommunityEventsActiveDiscordGetResponseDto,
  })
  getActiveEvents(): Promise<CommunityEventsActiveDiscordGetResponseDto> {
    return this.activeEventsService.getActiveEvents();
  }

  @Get('id/:communityEventId')
  @ApiOperation({ summary: 'Retrieve active events by ID.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: CommunityEventsActiveDiscordGetResponseDto,
  })
  getActiveEventsById(
    @Param() params: CommunityEventsActiveDiscordByIdGetRequestDto,
  ): Promise<CommunityEventsActiveDiscordGetResponseDto> {
    console.log('called');
    return this.activeEventsService.getActiveEventsById(params);
  }

  @Get('guild/:guildSId')
  @ApiOperation({ summary: 'Retrieve active events by guild.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: CommunityEventsActiveDiscordGetResponseDto,
  })
  getActiveEventsByGuildId(
    @Param() params: CommunityEventsActiveDiscordByGuildGetRequestDto,
  ): Promise<CommunityEventsActiveDiscordGetResponseDto> {
    return this.activeEventsService.getActiveEventsByGuildId(params);
  }

  @Get('organizer/:organizerSId')
  @ApiOperation({ summary: 'Retrieve active events by organizer.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: CommunityEventsActiveDiscordGetResponseDto,
  })
  getActiveEventsByOrganizerId(
    @Param() params: CommunityEventsActiveDiscordByOrganizerGetRequestDto,
  ): Promise<CommunityEventsActiveDiscordGetResponseDto> {
    return this.activeEventsService.getActiveEventsByOrganizerId(params);
  }

  @Get('voice-channel/:voiceChannelSId')
  @ApiOperation({ summary: 'Retrieve active events by voice channel.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: CommunityEventsActiveDiscordGetResponseDto,
  })
  getActiveEventsByVoiceChannelId(
    @Param() params: CommunityEventsActiveDiscordByVoiceChannelGetRequestDto,
  ): Promise<CommunityEventsActiveDiscordGetResponseDto> {
    return this.activeEventsService.getActiveEventsByVoiceChannelId(params);
  }

  @Get('guild/:guildSId/organizer/:organizerSId')
  @ApiOperation({ summary: 'Retrieve active events by guild and organizer.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: CommunityEventsActiveDiscordGetResponseDto,
  })
  getActiveEventsByGuildIdAndOrganizerId(
    @Param()
    params: CommunityEventsActiveDiscordByGuildAndOrganizerGetRequestDto,
  ): Promise<CommunityEventsActiveDiscordGetResponseDto> {
    return this.activeEventsService.getActiveEventsByGuildIdAndOrganizerId(
      params,
    );
  }
}
