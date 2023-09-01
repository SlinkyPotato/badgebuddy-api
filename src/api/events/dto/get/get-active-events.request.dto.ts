import { IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class GetActiveEventsRequestDto {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'The ID of the event',
  })
  eventId?: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'The ID of the guild',
  })
  guildId?: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'The ID of the organizer',
  })
  organizerId?: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'The ID of the voice channel',
  })
  voiceChannelId?: string;
}
