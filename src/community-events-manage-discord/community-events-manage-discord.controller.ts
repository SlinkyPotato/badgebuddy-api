import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityEventsManageDiscordService } from './community-events-manage-discord.service';
import {
  CommunityEventsManageDiscordDeleteRequestDto,
  CommunityEventsManageDiscordDeleteResponseDto,
  CommunityEventsManageDiscordPostRequestDto,
  CommunityEventsManageDiscordPostResponseDto,
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
    type: CommunityEventsManageDiscordPostResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event in this channel is already active',
  })
  startEvent(
    @Body() request: CommunityEventsManageDiscordPostRequestDto,
  ): Promise<CommunityEventsManageDiscordPostResponseDto> {
    return this.discordCommunityEventsManageService.startEvent(request);
  }

  @Delete()
  @ApiOperation({ summary: 'Stop tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Event stopped',
    type: CommunityEventsManageDiscordDeleteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event already stopped',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Active event not found',
  })
  stopEvent(
    @Body() request: CommunityEventsManageDiscordDeleteRequestDto,
  ): Promise<CommunityEventsManageDiscordDeleteResponseDto> {
    return this.discordCommunityEventsManageService.endEvent(request);
  }
}
