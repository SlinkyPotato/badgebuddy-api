import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DiscordCommunityEventsActiveByVoiceChannelGetRequestDto {
  @IsString()
  @ApiProperty({
    description: 'The snowflake ID of the voice channel',
  })
  voiceChannelSId: string;
}
