import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DiscordBoSettingsGetRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'guildId',
    required: true,
    description: 'The snowflake ID of the guild',    
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
