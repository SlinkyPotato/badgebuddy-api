import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DiscordBotDeleteRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'The snowflake ID of the guild',
    type: String,
  })
  guildSId: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The UUID of the discord bot settings for the guild',
    type: String,
  })
  botSettingsId?: string;
}
