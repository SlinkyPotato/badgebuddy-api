import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class DiscordBotPostResponseDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'ID of discord bot settings',
  })
  discordBotSettingsId: string;
}
