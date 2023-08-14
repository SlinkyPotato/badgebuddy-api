import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AuthGuard } from './guards/auth.guard';
import PutEventResponseDto from './dto/put/put-event.response.dto';
import PostEventRequestDto from './dto/post/post-event.request.dto';
import PostEventResponseDto from './dto/post/post-event.response.dto';
import PutEventRequestDto from './dto/put/put-event.request.dto';
import GetActiveEventResponseDto from './dto/get/get-active-event-response.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('events')
@ApiTags('events')
// @UseInterceptors(CacheInterceptor)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

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
    description: 'Event already exists and active',
  })
  start(@Body() request: PostEventRequestDto): Promise<PostEventResponseDto> {
    return this.eventsService.start(request);
  }

  @Put()
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
    type: GetActiveEventResponseDto,
  })
  getActive(
    @Query('guildId') guildId: string,
    @Query('organizerId') organizerId: string,
  ): Promise<GetActiveEventResponseDto> {
    return this.eventsService.getActiveEvents(guildId, organizerId);
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