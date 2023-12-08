import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DiscordCommunityEventsActiveByGuildAndOrganizerGetRequestDto {
  @ApiProperty({
    description: 'The guildSId of the guild to retrieve active events for.',
    type: String,
  })
  @IsNotEmpty()
  guildSId: string;

  @ApiProperty({
    description: 'The organizerSId of the organizer to retrieve active events for.',
    type: String,
  })
  @IsNotEmpty()
  organizerSId: string;
}
