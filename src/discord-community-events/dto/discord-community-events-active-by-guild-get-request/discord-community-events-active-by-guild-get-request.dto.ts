import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class DiscordCommunityEventsActiveByGuildGetRequestDto {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    required: true,
    description: 'The snowflake ID of the guild',
  })
  guildSId: string;
}
