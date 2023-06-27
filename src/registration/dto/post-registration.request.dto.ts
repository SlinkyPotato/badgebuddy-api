import { ApiProperty } from '@nestjs/swagger';

export class PostRegistrationRequestDto {
  @ApiProperty({ description: 'The ID of the guild' })
  guildId: string;

  @ApiProperty({ description: 'The name of the guild' })
  guildName: string;

  @ApiProperty({ description: 'The ID of the authorized degen role' })
  authorizedDegenRoleId: string;

  @ApiProperty({
    required: false,
    description: 'The ID of the category channel',
  })
  categoryChannelId: string;

  @ApiProperty({
    required: false,
    description: 'The ID of the private channel',
  })
  privateChannelId: string;

  @ApiProperty({
    required: false,
    description: 'The ID of the announcement channel',
  })
  announcementChannelId: string;
}
