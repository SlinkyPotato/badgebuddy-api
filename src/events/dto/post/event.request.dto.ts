import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsString } from 'class-validator';

export default class PostEventRequestDto {
  @ApiProperty({
    required: true,
    description: 'The ID of the guild',
  })
  @IsNumberString()
  guildId: string;

  @ApiProperty({
    required: true,
    description: 'The name of the event',
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the organizer',
  })
  @IsNumberString()
  organizerId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the tracking voice channel',
  })
  @IsNumberString()
  voiceChannelId: string;

  @ApiProperty({
    required: true,
    description: 'The duration in minutes',
  })
  @IsNumber()
  duration: number;
}
