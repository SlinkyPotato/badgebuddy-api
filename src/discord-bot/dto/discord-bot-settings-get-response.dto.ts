import { ApiProperty } from '@nestjs/swagger';

export class DiscordBotSettingsGetResponseDto {
  @ApiProperty({
    required: true,
    description: 'The ID of the settings record in the DB',
  })
  id: string;

  @ApiProperty({ required: true, description: 'The snowflake ID of the guild' })
  guildSId: string;

  @ApiProperty({ required: true, description: 'The name of the guild' })
  guildName: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the authorized POAP Management role',
  })
  poapManagerRoleId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the private channel',
  })
  privateChannelId: string;

  @ApiProperty({
    required: false,
    description: 'The ID of the announcement channel',
  })
  newsChannelId?: string;
}
