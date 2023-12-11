import { Body, Controller, HttpStatus, Patch, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiscordCommunityEventsManagementService } from './discord-community-events-management.service';
import { PoapManagerGuard } from './guards/poap-manager.guard';
import {
  DiscordCommunityEventPostResponseDto,
  DiscordCommunityEventPostRequestDto,
  DiscordCommunityEventPatchResponseDto,
  DiscordCommunityEventPatchRequestDto
} from '@badgebuddy/common';

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
