import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DiscordBoSettingsGetRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    name: 'guildSId',
    description: 'The snowflake ID of the guild',    
  })
  guildSId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    name: 'botSettingsId',
    description: 'The UUID of the discord bot settings for the guild',
    type: String,
  })
  botSettingsId?: string;
}
