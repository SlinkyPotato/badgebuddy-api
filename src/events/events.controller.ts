import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import PostEventRequestDto from './dto/post/event.request.dto';

@Controller('events')
@ApiTags('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Start tracking a voice channel event.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event started',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event already started',
  })
  create(
    @Param('id', ParseIntPipe) id: string,
    @Body() request: PostEventRequestDto,
  ): Promise<string> {
    return this.eventsService.create(id, request);
  }
}
