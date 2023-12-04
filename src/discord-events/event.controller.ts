import { Body, Controller, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import PostEventRequestDto from './dto/event-post-request.dto';
import { AuthGuard } from './guards/auth.guard';
import { EventsService } from './events.service';
import PostEventResponseDto from './dto/event-post-response.dto';
import PutEventRequestDto from './dto/event-put-request.dto';
import PutEventResponseDto from './dto/event-put-response.dto';

@Controller('event')
export class EventController {

  constructor(
    private readonly eventsService: EventsService
  ) { }
  
  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Start tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event started',
    type: PostEventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event in this channel is already active',
  })
  start(@Body() request: PostEventRequestDto): Promise<PostEventResponseDto> {
    return this.eventsService.start(request);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Stop tracking voice channel event.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event stopped',
    type: PutEventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event already stopped',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Active event not found',
  })
  stop(@Body() request: PutEventRequestDto): Promise<PutEventResponseDto> {
    return this.eventsService.stop(request);
  }

}
