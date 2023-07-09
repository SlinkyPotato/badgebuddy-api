import { ApiProperty } from '@nestjs/swagger';

export class PostRegistrationRequestDto {
  @ApiProperty({ required: true, description: 'The ID of the guild' })
  guildId: string;

  @ApiProperty({ required: true, description: 'The name of the guild' })
  guildName: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the authorized POAP Management role',
  })
  roleId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the private channel',
  })
  channelId: string;

  @ApiProperty({
    required: false,
    description: 'The ID of the announcement channel',
  })
  newsChannelId: string;
}
