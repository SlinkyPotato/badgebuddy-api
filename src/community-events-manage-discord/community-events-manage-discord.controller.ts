import {
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityEventsManageDiscordService } from './community-events-manage-discord.service';
import {
  CommunityEventsManageDiscordEndEventRequestDto,
  CommunityEventsManageDiscordEndEventResponseDto,
  CommunityEventsManageDiscordStartEventRequestDto,
  CommunityEventsManageDiscordStartEventResponseDto,
} from '@badgebuddy/common';
import { PoapManagerGuard } from '@/auth/guards/poap-manager/poap-manager.guard';

@Controller('community-events/manage/discord')
@ApiTags('Community Events Management for Discord')
@UsePipes(ValidationPipe)
@UseGuards(PoapManagerGuard)
export class CommunityEventsManageDiscordController {
  constructor(
    private readonly discordCommunityEventsManageService: CommunityEventsManageDiscordService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event started',
    type: CommunityEventsManageDiscordStartEventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event in this channel is already active',
  })
  startEvent(
    @Body() request: CommunityEventsManageDiscordStartEventRequestDto,
  ): Promise<CommunityEventsManageDiscordStartEventResponseDto> {
    return this.discordCommunityEventsManageService.startEvent(request);
  }

  @Patch()
  @ApiOperation({ summary: 'Stop tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Event stopped',
    type: CommunityEventsManageDiscordEndEventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event already stopped',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Active event not found',
  })
  endEvent(
    @Body() request: CommunityEventsManageDiscordEndEventRequestDto,
  ): Promise<CommunityEventsManageDiscordEndEventResponseDto> {
    return this.discordCommunityEventsManageService.endEvent(request);
  }
}
