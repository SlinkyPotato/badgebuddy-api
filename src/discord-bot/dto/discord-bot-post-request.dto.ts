import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumberString, IsOptional } from 'class-validator';

export class DiscordBotPostRequestDto {
  @IsString()
  @ApiProperty({
    required: true,
    description: 'The ID of the guild given from discord.',
  })
  guildSId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the authorized POAP Management role',
  })
  @IsNumberString()
  poapManagerRoleId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the private channel',
  })
  @IsNumberString()
  privateChannelId: string;

  @ApiProperty({
    required: false,
    description: 'The ID of the announcement channel',
  })
  @IsNumberString()
  @IsOptional()
  newsChannelId?: string;
}
