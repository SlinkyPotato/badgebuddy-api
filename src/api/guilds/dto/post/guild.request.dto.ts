import { IsNumberString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class PostGuildRequestDto {
  @ApiProperty({ required: true, description: 'The name of the guild' })
  @IsString()
  guildName: string;

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
  newsChannelId: string;
}
