import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DiscordBotPostResponseDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'ID of discord bot settings',
  })
  discordBotSettingsId: string;

  @IsString()
  @ApiProperty({
    description: 'The snowflake ID of the poapManagerRoleSId'
  })
  poapManagerRoleSId: string;

  @IsString()
  @ApiProperty({
    description: 'The snowflake ID of the privateChannelSId'
  })
  privateChannelSId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The snowflake ID of the newsChannelSId',
    required: false,
  })
  newsChannelSId?: string;

}
