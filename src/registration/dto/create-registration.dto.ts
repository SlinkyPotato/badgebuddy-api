import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty()
  guildId: string;

  @ApiProperty()
  guildName: string;

  @ApiProperty()
  authorizedDegenRoleId: string;

  @ApiProperty({ required: false })
  categoryChannelId: string;

  @ApiProperty({ required: false })
  privateChannelId: string;

  @ApiProperty({ required: false })
  announcementChannelId: string;
}
