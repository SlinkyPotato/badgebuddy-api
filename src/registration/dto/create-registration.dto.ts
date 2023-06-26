import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty()
  guildId: string;

  @ApiProperty()
  guildName: string;

  @ApiProperty()
  authorizedDegenRoleId: string;

  @ApiProperty()
  categoryChannelId: string;

  @ApiProperty()
  privateChannelId: string;

  @ApiProperty()
  announcementChannelId: string;
}
