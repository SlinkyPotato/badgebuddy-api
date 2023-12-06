import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class DiscordCommunityEventsActiveByIdGetRequestDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The discord community event ID of the event',
  })
  communityEventId: string;
}
