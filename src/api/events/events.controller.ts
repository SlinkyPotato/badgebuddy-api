import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AuthGuard } from './guards/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ValidateGetActiveEventsQueryPipe } from './pipes/validate-get-active-events-query.pipe';
import GetActiveEventsRequestDto from './dto/active-events-get-request.dto';
import GetActiveEventsResponseDto from './dto/active-events-get-response.dto';
import PostEventRequestDto from './dto/event-post-request.dto';
import PostEventResponseDto from './dto/event-post-response.dto';
import PutEventRequestDto from './dto/event-put-request.dto';
import PutEventResponseDto from './dto/event-put-response.dto';

@Controller('events')
@ApiTags('events')
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

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

  @Get('/active')
  @ApiOperation({ summary: 'Retrieve active events.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active events retrieved.',
    type: GetActiveEventsResponseDto,
  })
  getActive(
    @Query(ValidateGetActiveEventsQueryPipe)
    query: GetActiveEventsRequestDto,
  ): Promise<GetActiveEventsResponseDto> {
    return this.eventsService.getActiveEvents(query);
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
