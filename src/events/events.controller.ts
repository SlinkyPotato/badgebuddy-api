import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import PostEventRequestDto from './dto/post/event.request.dto';
import PostEventResponseDto from './dto/post/event.response.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('events')
@ApiTags('events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Start tracking a voice channel event.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event started',
    type: PostEventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event already exists and active',
  })
  create(@Body() request: PostEventRequestDto): Promise<PostEventResponseDto> {
    return this.eventsService.create(request);
  }

  // TODO: Implement this endpoint
  @Post('/distribution')
  @ApiOperation({ summary: 'Manually distribute POAPs.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'POAPs distributed',
    type: String,
  })
  disburse(@Body() request: PostEventRequestDto): any {
    return '';
  }
}
