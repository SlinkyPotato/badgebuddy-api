import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsNumberString, IsString } from 'class-validator';

class ActiveEventDto {
  @ApiProperty({
    required: true,
    description: 'The ID of the event',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    required: false,
    description: 'The name of the event',
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the guild',
  })
  @IsNumberString()
  guildId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the voice channel',
  })
  @IsNumberString()
  voiceChannelId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the organizer',
  })
  @IsNumberString()
  organizerId: string;

  @ApiProperty({
    required: true,
    description: 'The start date of the event',
  })
  @IsISO8601()
  startDate: Date;

  @ApiProperty({
    required: true,
    description: 'The end date of the event',
  })
  @IsISO8601()
  endDate: Date;
}

export default class GetActiveEventsResponseDto {
  @ApiProperty({
    required: true,
    description: 'List of active events',
    type: [ActiveEventDto],
  })
  @IsArray()
  events: ActiveEventDto[];
}
