import { ApiProperty } from '@nestjs/swagger';

export default class PostEventRequestDto {
  @ApiProperty({
    required: true,
    description: 'The ID of the guild',
  })
  guildId: string;

  @ApiProperty({
    required: true,
    description: 'The name of the event',
  })
  eventName: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the organizer',
  })
  organizerId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the tracking voice channel',
  })
  channelId: string;

  @ApiProperty({
    required: true,
    description: 'The duration in minutes',
  })
  duration: number;
}
