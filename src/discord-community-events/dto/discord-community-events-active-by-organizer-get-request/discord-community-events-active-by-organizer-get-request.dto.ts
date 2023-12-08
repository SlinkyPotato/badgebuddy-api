import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DiscordCommunityEventsActiveByOrganizerGetRequestDto {
  @IsString()
  @ApiProperty({
    description: 'The snowflake ID of the organizer',
    type: String,
  })
  organizerSId: string;
}
