import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ValidateGetActiveEventsQueryPipe } from './pipes/validate-get-active-events-query.pipe';
import GetActiveEventsRequestDto from './dto/active-events-get-request.dto';
import GetActiveEventsResponseDto from './dto/active-events-get-response.dto';


@Controller('discord/events')
@ApiTags('Discord Events')
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
export class EventsController {

  constructor(
    private readonly eventsService: EventsService
  ) { }

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
}
