import { Body, Controller, HttpStatus, Patch, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiscordCommunityEventsManagementService } from './discord-community-events-management.service';
import { DiscordCommunityEventPostRequestDto } from './dto/discord-community-event-post-request/discord-community-event-post-request.dto';
import { DiscordCommunityEventPostResponseDto } from './dto/discord-community-event-post-response/discord-community-event-post-response.dto';
import { DiscordCommunityEventPatchRequestDto } from './dto/discord-community-event-patch-request/discord-community-event-patch-request.dto';
import { DiscordCommunityEventPatchResponseDto } from './dto/discord-community-event-patch-response/discord-community-event-patch-response.dto';
import { PoapManagerGuard } from './guards/poap-manager.guard';

@Controller('discord/community-events/manage')
@ApiTags('Discord Community Events Management')
@UsePipes(ValidationPipe)
@UseGuards(PoapManagerGuard)
export class DiscordCommunityEventsManagementController {

  constructor(
    private readonly managementService: DiscordCommunityEventsManagementService
  ) { }
  
  @Post()
  @ApiOperation({ summary: 'Start tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event started',
    type: DiscordCommunityEventPostResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event in this channel is already active',
  })
  startEvent(
    @Body() request: DiscordCommunityEventPostRequestDto
  ): Promise<DiscordCommunityEventPostResponseDto> {
    return this.managementService.startEvent(request);
  }

  @Patch()
  @ApiOperation({ summary: 'Stop tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event stopped',
    type: DiscordCommunityEventPatchResponseDto,
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
    @Body() request: DiscordCommunityEventPatchRequestDto
  ): Promise<DiscordCommunityEventPatchResponseDto> {
    return this.managementService.stopEvent(request);
  }

}
